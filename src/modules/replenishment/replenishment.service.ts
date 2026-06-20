import httpStatus from 'http-status';
import { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { GoodsReceiptNote } from '../goods-receipt-note/goods-receipt-note.model';
import { PurchaseOrder, PurchaseOrderItem } from '../purchase-order/purchase-order.model';
import StockMovement from '../stock-movement/stock-movement.model';
import Stock from '../stock/stock.model';
import { generateRunningNumber } from '../utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReplenishmentItem {
  stockId: string;
  productId: string;
  warehouseId: string;
  supplierId: string | null;
  availableQuantity: number;
  reorderLevel: number;
  maxStockLevel: number;
  suggestedOrderQty: number;
  avgDailySales: number;
  velocity30d: number; // total units sold last 30 days
  lastPurchasePrice: number;
  estimatedCost: number;
  hasOpenPO: boolean;
}

export interface ReplenishmentPreview {
  warehouseId?: string;
  totalItemsBelow: number;
  skippedHasOpenPO: number;
  suggestions: ReplenishmentItem[];
  groupedBySupplier: Record<string, ReplenishmentItem[]>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Finds the most recent GRN for a product/warehouse pair and returns the supplierId.
 * This is used to group replenishment items by supplier.
 */
const findLastSupplierId = async (productId: string, warehouseId: string): Promise<string | null> => {
  const grn = await GoodsReceiptNote.findOne({ warehouseId, status: 'received' })
    .sort({ createdAt: -1 })
    .select('supplierId')
    .lean();
  return grn?.supplierId ? String(grn.supplierId) : null;
};

/**
 * Computes 30-day sales velocity for a stock record.
 * Returns total qty sold and average daily sales.
 */
const computeSalesVelocity = async (stockId: string): Promise<{ total: number; avgDaily: number }> => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const movements = await StockMovement.find({
    stockId: new Types.ObjectId(stockId),
    type: 'OUT',
    createdAt: { $gte: since },
  })
    .select('quantity')
    .lean();

  const total = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  return { total, avgDaily: parseFloat((total / 30).toFixed(4)) };
};

/**
 * Checks whether an approved/draft PO already covers this product+warehouse
 * to avoid duplicate orders.
 */
const hasOpenPurchaseOrder = async (productId: string, warehouseId: string): Promise<boolean> => {
  const openPOs = await PurchaseOrder.find({
    warehouseId: new Types.ObjectId(warehouseId),
    status: { $in: ['draft', 'approved'] },
  })
    .select('_id')
    .lean();

  if (!openPOs.length) return false;

  const poIds = openPOs.map((po) => po._id);
  const item = await PurchaseOrderItem.findOne({
    purchaseOrderId: { $in: poIds },
    productId: new Types.ObjectId(productId),
  }).lean();

  return !!item;
};

// ─── Preview ─────────────────────────────────────────────────────────────────

/**
 * Returns a read-only preview of what would be replenished — no POs are created.
 * Useful to review before committing.
 */
export const getReplenishmentPreview = async (warehouseId?: string): Promise<ReplenishmentPreview> => {
  const filter: any = {
    $expr: { $lte: ['$availableQuantity', '$reorderLevel'] },
    status: { $ne: 'inactive' },
  };
  if (warehouseId) filter.warehouseId = new Types.ObjectId(warehouseId);

  const lowStocks = await Stock.find(filter).lean();

  const suggestions: ReplenishmentItem[] = [];
  let skippedHasOpenPO = 0;

  for (const stock of lowStocks) {
    const pid = String(stock.productId);
    const wid = String(stock.warehouseId);
    const sid = String(stock._id);

    const openPO = await hasOpenPurchaseOrder(pid, wid);
    if (openPO) {
      skippedHasOpenPO++;
      continue;
    }

    const { total: velocity30d, avgDaily } = await computeSalesVelocity(sid);
    const supplierId = await findLastSupplierId(pid, wid);

    // Suggested order quantity: fill up to maxStockLevel, minimum the reorder gap
    const deficitToMax = Math.max(0, stock.maxStockLevel - stock.availableQuantity);
    // Ensure at least 7 days of demand if maxStockLevel not configured
    const demandBuffer = Math.ceil(avgDaily * 7);
    const suggestedOrderQty = Math.max(deficitToMax, demandBuffer, 1);

    suggestions.push({
      stockId: sid,
      productId: pid,
      warehouseId: wid,
      supplierId,
      availableQuantity: stock.availableQuantity,
      reorderLevel: stock.reorderLevel,
      maxStockLevel: stock.maxStockLevel,
      suggestedOrderQty,
      avgDailySales: avgDaily,
      velocity30d,
      lastPurchasePrice: stock.lastPurchasePrice,
      estimatedCost: parseFloat((suggestedOrderQty * stock.lastPurchasePrice).toFixed(2)),
      hasOpenPO: false,
    });
  }

  // Group by supplierId
  const groupedBySupplier: Record<string, ReplenishmentItem[]> = {};
  for (const item of suggestions) {
    const key = item.supplierId ?? 'unassigned';
    if (!groupedBySupplier[key]) groupedBySupplier[key] = [];
    groupedBySupplier[key].push(item);
  }

  return {
    warehouseId,
    totalItemsBelow: lowStocks.length,
    skippedHasOpenPO,
    suggestions,
    groupedBySupplier,
  };
};

// ─── Auto-PO Creation ─────────────────────────────────────────────────────────

export interface ReplenishmentRunResult {
  preview: ReplenishmentPreview;
  purchaseOrdersCreated: Array<{
    supplierId: string;
    poNumber: string;
    poId: string;
    itemCount: number;
    estimatedTotal: number;
  }>;
  unassignedItems: ReplenishmentItem[];
}

/**
 * Runs the replenishment engine:
 * 1. Finds all stocks below reorder level (with no open PO)
 * 2. Groups by supplier
 * 3. Creates one draft PurchaseOrder per supplier
 * Items with no known supplier are collected in `unassignedItems` for manual review.
 *
 * @param warehouseId Optional scope to a single warehouse
 * @param actorId     User triggering the run (set as createdBy on POs)
 */
export const runReplenishment = async (
  warehouseId: string | undefined,
  actorId: string
): Promise<ReplenishmentRunResult> => {
  const preview = await getReplenishmentPreview(warehouseId);

  const purchaseOrdersCreated: ReplenishmentRunResult['purchaseOrdersCreated'] = [];
  const unassignedItems: ReplenishmentItem[] = [];

  const supplierGroups = preview.groupedBySupplier;

  for (const [supplierId, items] of Object.entries(supplierGroups)) {
    if (supplierId === 'unassigned') {
      unassignedItems.push(...items);
      continue;
    }

    // All items in the group belong to the same warehouse (scoped above)
    const wid = items[0].warehouseId;

    // Calculate PO totals
    let subtotal = 0;
    let taxAmount = 0;
    const poItems = items.map((item) => {
      const lineTotal = item.suggestedOrderQty * item.lastPurchasePrice;
      subtotal += lineTotal;
      return {
        productId: item.productId,
        orderedQty: item.suggestedOrderQty,
        receivedQty: 0,
        unitCost: item.lastPurchasePrice,
        gstRate: 0, // Will be filled by the manager before approval
        discountAmount: 0,
        lineTotal,
      };
    });

    try {
      const poNumber = await generateRunningNumber(config.numbering.poPrefix, 'purchase_order');

      const po = await PurchaseOrder.create({
        poNumber,
        warehouseId: new Types.ObjectId(wid),
        supplierId: new Types.ObjectId(supplierId),
        status: 'draft',
        orderDate: new Date(),
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount: subtotal + taxAmount,
        note: `Auto-generated by replenishment engine on ${new Date().toISOString()}`,
        createdBy: new Types.ObjectId(actorId),
      });

      await PurchaseOrderItem.insertMany(
        poItems.map((item) => ({
          ...item,
          purchaseOrderId: po._id,
          productId: new Types.ObjectId(item.productId),
        }))
      );

      purchaseOrdersCreated.push({
        supplierId,
        poNumber,
        poId: String(po._id),
        itemCount: items.length,
        estimatedTotal: parseFloat(subtotal.toFixed(2)),
      });
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to create PO for supplier ${supplierId}: ${err.message}`);
    }
  }

  return { preview, purchaseOrdersCreated, unassignedItems };
};

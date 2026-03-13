import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { Product } from '../product';
import { PurchaseOrderService } from '../purchase-order';
import { StockBatchService } from '../stock-batch';
import { createStockMovement } from '../stock-movement/stock-movement.service';
import { applyStockDelta, upsertStockSummary } from '../stock/stock.service';
import { generateRunningNumber, getPagination } from '../utils';
import { GoodsReceiptNote, GoodsReceiptNoteItem } from './goods-receipt-note.model';

export const createGRN = async (payload: any) => {
  const grnNumber = await generateRunningNumber(config.numbering.grnPrefix, 'grn');
  const grn = await GoodsReceiptNote.create({
    grnNumber,
    purchaseOrderId: new Types.ObjectId(payload.purchaseOrderId),
    warehouseId: new Types.ObjectId(payload.warehouseId),
    supplierId: new Types.ObjectId(payload.supplierId),
    invoiceNo: payload.invoiceNo,
    invoiceDate: payload.invoiceDate ? new Date(payload.invoiceDate) : undefined,
    status: 'draft',
    note: payload.note,
  });

  await GoodsReceiptNoteItem.insertMany(
    payload.items.map((item: any) => ({
      ...item,
      grnId: grn._id,
      productId: new Types.ObjectId(item.productId),
      locationId: item.locationId ? new Types.ObjectId(item.locationId) : undefined,
    }))
  );

  return getGRNById(String(grn._id));
};

export const applyGRNReceipt = async (grnId: string, actorId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const grn = await GoodsReceiptNote.findById(grnId).session(session);
    if (!grn) throw new ApiError(httpStatus.NOT_FOUND, 'GRN not found');
    if (grn.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft GRN can be received');

    const grnItems = await GoodsReceiptNoteItem.find({ grnId: grn._id }).session(session);

    for (const item of grnItems) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid product in GRN item');

      const totalQty = item.receivedQty + item.freeQty;
      const stock = await upsertStockSummary(
        {
          productId: String(item.productId),
          warehouseId: String(grn.warehouseId),
          locationId: item.locationId ? String(item.locationId) : null,
        },
        {
          quantity: 0,
          minStockLevel: 0,
          lastPurchasePrice: item.unitCost,
          weightedAverageCost: item.unitCost,
        },
        session
      );
      if (!stock) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create stock summary');

      const updatedStock = await applyStockDelta(
        String(stock._id),
        {
          quantityDelta: totalQty,
          lastPurchasePrice: item.unitCost,
          weightedAverageCost: item.unitCost,
        },
        session
      );

      if (product.batchEnabled && item.batchNo) {
        await StockBatchService.createOrUpdateBatch(
          {
            stockId: String(stock._id),
            productId: String(item.productId),
            warehouseId: String(grn.warehouseId),
            locationId: item.locationId ? String(item.locationId) : undefined,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate,
            quantity: totalQty,
            purchasePrice: item.unitCost,
            salePrice: item.salePrice,
            mrp: item.mrp,
            supplierId: String(grn.supplierId),
            grnId: String(grn._id),
          },
          session
        );
      }

      await createStockMovement(
        {
          stockId: String(stock._id),
          productId: String(item.productId),
          warehouseId: String(grn.warehouseId),
          locationId: item.locationId ? String(item.locationId) : undefined,
          type: 'IN',
          movementType: 'purchase',
          quantity: totalQty,
          unitCost: item.unitCost,
          unitPrice: item.salePrice,
          amount: totalQty * item.unitCost,
          gstAmount: (totalQty * item.unitCost * item.gstRate) / 100,
          referenceType: 'grn',
          referenceId: grn.grnNumber,
          purchaseOrderId: String(grn.purchaseOrderId),
          grnId: String(grn._id),
          priceType: 'costPrice',
          note: grn.note,
          balanceAfterMovement: updatedStock.availableQuantity,
          createdBy: actorId,
        },
        session
      );

      await PurchaseOrderService.addReceivedQtyForPOItem(String(grn.purchaseOrderId), String(item.productId), totalQty, session);
    }

    grn.status = 'received';
    grn.receivedBy = new Types.ObjectId(actorId);
    await grn.save({ session });

    await session.commitTransaction();
    return getGRNById(grnId);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const listGRN = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.warehouseId) filter.warehouseId = query.warehouseId;

  const [items, totalItems] = await Promise.all([
    GoodsReceiptNote.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    GoodsReceiptNote.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

export const getGRNById = async (id: string) => {
  const grn = await GoodsReceiptNote.findById(id);
  if (!grn) throw new ApiError(httpStatus.NOT_FOUND, 'GRN not found');
  const items = await GoodsReceiptNoteItem.find({ grnId: grn._id });
  return { ...grn.toObject(), items };
};

export const cancelGRN = async (id: string) => {
  const grn = await GoodsReceiptNote.findById(id);
  if (!grn) throw new ApiError(httpStatus.NOT_FOUND, 'GRN not found');
  if (grn.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft GRN can be cancelled');
  grn.status = 'cancelled';
  await grn.save();
  return grn;
};

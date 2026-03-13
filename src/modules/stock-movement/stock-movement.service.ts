import { Types } from 'mongoose';
import { getPagination } from '../utils';
import StockMovement from './stock-movement.model';
import { CreateMovementDTO } from './stock-movement.types';

export const createStockMovement = async (payload: CreateMovementDTO, session?: any) =>
  StockMovement.create(
    [
      {
        stockId: new Types.ObjectId(payload.stockId),
        batchId: payload.batchId ? new Types.ObjectId(payload.batchId) : undefined,
        productId: new Types.ObjectId(payload.productId),
        warehouseId: new Types.ObjectId(payload.warehouseId),
        locationId: payload.locationId ? new Types.ObjectId(payload.locationId) : undefined,
        type: payload.type,
        movementType: payload.movementType,
        quantity: payload.quantity,
        unitCost: payload.unitCost,
        unitPrice: payload.unitPrice,
        amount: payload.amount,
        gstAmount: payload.gstAmount,
        referenceType: payload.referenceType,
        referenceId: payload.referenceId,
        invoiceId: payload.invoiceId ? new Types.ObjectId(payload.invoiceId) : undefined,
        purchaseOrderId: payload.purchaseOrderId ? new Types.ObjectId(payload.purchaseOrderId) : undefined,
        grnId: payload.grnId ? new Types.ObjectId(payload.grnId) : undefined,
        inHouseUser: payload.inHouseUser,
        staffId: payload.staffId,
        priceType: payload.priceType,
        note: payload.note,
        balanceAfterMovement: payload.balanceAfterMovement,
        createdBy: payload.createdBy ? new Types.ObjectId(payload.createdBy) : undefined,
      },
    ],
    session ? { session } : undefined
  ).then((rows) => rows[0]);

export const listMovements = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.productId) filter.productId = query.productId;
  if (query.type) filter.type = query.type;
  if (query.movementType) filter.movementType = query.movementType;
  if (query.referenceType) filter.referenceType = query.referenceType;
  if (query.referenceId) filter.referenceId = query.referenceId;
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const [items, totalItems] = await Promise.all([
    StockMovement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    StockMovement.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 },
  };
};

export const getMovementById = async (id: string) => StockMovement.findById(id);

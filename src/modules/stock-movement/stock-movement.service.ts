import { Types } from 'mongoose';
import StockMovement from './stock-movement.model';
import { CreateMovementDTO } from './stock-movement.types';

export const createMovement = async (payload: CreateMovementDTO, session?: any) =>
  StockMovement.create(
    [
      {
        stockId: new Types.ObjectId(payload.stockId),
        warehouseId: new Types.ObjectId(payload.warehouseId),
        type: payload.type,
        quantity: payload.quantity,
        referenceType: payload.referenceType,
        referenceId: payload.referenceId,
        note: payload.note,
        createdBy: payload.createdBy ? new Types.ObjectId(payload.createdBy) : undefined,
      },
    ],
    session ? { session } : undefined
  );

export const listMovements = async (query: Record<string, any>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(1, Math.min(Number(query.limit) || 20, 100));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.stockId) filter.stockId = query.stockId;
  if (query.type) filter.type = query.type;

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const [rows, total] = await Promise.all([
    StockMovement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    StockMovement.countDocuments(filter),
  ]);

  return { data: rows, meta: { page, limit, total } };
};

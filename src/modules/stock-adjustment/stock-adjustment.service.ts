import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { StockBatchService } from '../stock-batch';
import { createStockMovement } from '../stock-movement/stock-movement.service';
import { applyStockDelta, getStockById } from '../stock/stock.service';
import { generateRunningNumber, getPagination } from '../utils';
import { StockAdjustment, StockAdjustmentItem } from './stock-adjustment.model';

export const createAdjustment = async (payload: any, actorId: string) => {
  const adjustmentNo = await generateRunningNumber(config.numbering.adjustmentPrefix, 'stock_adjustment');

  const adjustment = await StockAdjustment.create({
    adjustmentNo,
    warehouseId: new Types.ObjectId(payload.warehouseId),
    reason: payload.reason,
    note: payload.note,
    status: 'draft',
    createdBy: new Types.ObjectId(actorId),
  });

  await StockAdjustmentItem.insertMany(
    payload.items.map((item: any) => ({
      adjustmentId: adjustment._id,
      stockId: new Types.ObjectId(item.stockId),
      batchId: item.batchId ? new Types.ObjectId(item.batchId) : undefined,
      expectedQty: item.expectedQty,
      actualQty: item.actualQty,
      differenceQty: item.differenceQty,
      note: item.note,
    }))
  );

  return getAdjustmentById(String(adjustment._id));
};

export const applyStockAdjustment = async (adjustmentId: string, actorId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const adjustment = await StockAdjustment.findById(adjustmentId).session(session);
    if (!adjustment) throw new ApiError(httpStatus.NOT_FOUND, 'Stock adjustment not found');
    if (adjustment.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft adjustment can be applied');

    const items = await StockAdjustmentItem.find({ adjustmentId: adjustment._id }).session(session);

    for (const item of items) {
      const stock = await getStockById(String(item.stockId));
      const updatedStock = await applyStockDelta(String(item.stockId), { quantityDelta: item.differenceQty }, session);

      if (item.batchId) {
        await StockBatchService.applyBatchDelta(String(item.batchId), { quantityDelta: item.differenceQty }, session);
      }

      await createStockMovement(
        {
          stockId: String(item.stockId),
          batchId: item.batchId ? String(item.batchId) : undefined,
          productId: String(stock.productId),
          warehouseId: String(stock.warehouseId),
          locationId: stock.locationId ? String(stock.locationId) : undefined,
          type: 'ADJUSTMENT',
          movementType:
            adjustment.reason === 'damage'
              ? 'damage'
              : adjustment.reason === 'expiry'
                ? 'expiry'
                : 'manualAdjustment',
          quantity: item.differenceQty,
          referenceType: 'stockAdjustment',
          referenceId: adjustment.adjustmentNo,
          note: item.note || adjustment.note,
          balanceAfterMovement: updatedStock.availableQuantity,
          createdBy: actorId,
        },
        session
      );
    }

    adjustment.status = 'applied';
    adjustment.approvedBy = new Types.ObjectId(actorId);
    await adjustment.save({ session });

    await session.commitTransaction();
    return getAdjustmentById(adjustmentId);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const listAdjustments = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.reason) filter.reason = query.reason;

  const [items, totalItems] = await Promise.all([
    StockAdjustment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    StockAdjustment.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

export const getAdjustmentById = async (id: string) => {
  const adjustment = await StockAdjustment.findById(id);
  if (!adjustment) throw new ApiError(httpStatus.NOT_FOUND, 'Stock adjustment not found');
  const items = await StockAdjustmentItem.find({ adjustmentId: adjustment._id });
  return { ...adjustment.toObject(), items };
};

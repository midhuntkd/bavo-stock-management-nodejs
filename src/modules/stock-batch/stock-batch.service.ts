import httpStatus from 'http-status';
import { ClientSession } from 'mongoose';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import StockBatch from './stock-batch.model';

export const createOrUpdateBatch = async (
  payload: {
    stockId: string;
    productId: string;
    warehouseId: string;
    locationId?: string;
    batchNo: string;
    lotNo?: string;
    mfgDate?: Date;
    expiryDate?: Date;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
    mrp: number;
    supplierId?: string;
    grnId?: string;
  },
  session?: ClientSession
) => {
  const batchNo = payload.batchNo.trim().toUpperCase();
  let batch = await StockBatch.findOne({ stockId: payload.stockId, batchNo }).session(session || null);

  if (!batch) {
    batch = await StockBatch.create(
      [
        {
          ...payload,
          batchNo,
          availableQuantity: payload.quantity,
        },
      ],
      session ? { session } : undefined
    ).then((rows) => rows[0]);
  } else {
    batch.quantity += payload.quantity;
    batch.availableQuantity = batch.quantity - batch.reservedQuantity;
    batch.purchasePrice = payload.purchasePrice;
    batch.salePrice = payload.salePrice;
    batch.mrp = payload.mrp;
    batch.status = 'active';
    batch.expiryDate = payload.expiryDate;
    batch.mfgDate = payload.mfgDate;
    await batch.save({ session });
  }

  return batch;
};

export const listBatches = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.productId) filter.productId = query.productId;
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.stockId) filter.stockId = query.stockId;
  if (query.status) filter.status = query.status;
  if (query.expiryBefore) filter.expiryDate = { $lte: new Date(query.expiryBefore) };

  const [items, totalItems] = await Promise.all([
    StockBatch.find(filter).sort({ expiryDate: 1, createdAt: 1 }).skip(skip).limit(limit),
    StockBatch.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

export const getBatchById = async (id: string) => {
  const doc = await StockBatch.findById(id);
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Stock batch not found');
  return doc;
};

export const updateBatchStatus = async (id: string, status: 'active' | 'expired' | 'damaged' | 'blocked') => {
  const doc = await StockBatch.findByIdAndUpdate(id, { status }, { new: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Stock batch not found');
  return doc;
};

export const applyBatchDelta = async (
  batchId: string,
  delta: { quantityDelta?: number; reservedDelta?: number },
  session?: ClientSession
) => {
  const batch = await StockBatch.findById(batchId).session(session || null);
  if (!batch) throw new ApiError(httpStatus.NOT_FOUND, 'Stock batch not found');

  batch.quantity += delta.quantityDelta || 0;
  batch.reservedQuantity += delta.reservedDelta || 0;
  if (batch.quantity < 0 || batch.reservedQuantity < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid batch quantity');
  }
  batch.availableQuantity = batch.quantity - batch.reservedQuantity;
  if (batch.availableQuantity < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Batch available quantity cannot be negative');
  }

  await batch.save({ session });
  return batch;
};

export const selectBatchesForIssue = async (stockId: string, requiredQty: number, session?: ClientSession) => {
  const now = new Date();
  const candidates = await StockBatch.find({ stockId, status: 'active', availableQuantity: { $gt: 0 } })
    .sort({ expiryDate: 1, createdAt: 1 })
    .session(session || null);

  let pending = requiredQty;
  const allocations: Array<{ batchId: string; quantity: number }> = [];

  for (const batch of candidates) {
    if (batch.expiryDate && batch.expiryDate < now) continue;
    if (pending <= 0) break;
    const qty = Math.min(pending, batch.availableQuantity);
    if (qty <= 0) continue;
    allocations.push({ batchId: String(batch._id), quantity: qty });
    pending -= qty;
  }

  if (pending > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient FEFO batch stock');
  }

  return allocations;
};

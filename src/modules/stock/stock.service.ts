import mongoose, { Types } from 'mongoose';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import * as WarehouseService from '../warehouse/warehouse.service';
import * as StockMovementService from '../stock-movement/stock-movement.service';
import Stock from './stock.model';
import { CreateStockDTO, StockAdjustDTO, StockOperationDTO, TransferStockDTO, UpdateStockDTO } from './stock.types';

const recalculate = (quantity: number, reservedQuantity: number) => {
  const availableQuantity = quantity - reservedQuantity;
  if (quantity < 0 || reservedQuantity < 0 || availableQuantity < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid stock quantities');
  }
  return { availableQuantity };
};

const ensureWarehouseActive = async (warehouseId: string) => {
  const exists = await WarehouseService.existsWarehouse(warehouseId);
  if (!exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or inactive warehouse');
  }
};

export const createStock = async (payload: CreateStockDTO, actorId: string) => {
  await ensureWarehouseActive(payload.warehouseId);

  const normalizedSku = payload.sku.toUpperCase();
  const exists = await Stock.findOne({ warehouseId: payload.warehouseId, sku: normalizedSku });
  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Stock item with this SKU already exists in warehouse');
  }

  const quantity = payload.quantity;
  const reservedQuantity = payload.reservedQuantity || 0;
  const { availableQuantity } = recalculate(quantity, reservedQuantity);

  const doc = await Stock.create({
    ...payload,
    sku: normalizedSku,
    quantity,
    reservedQuantity,
    availableQuantity,
    minimumStockLevel: payload.minimumStockLevel || 0,
    createdBy: new Types.ObjectId(actorId),
    updatedBy: new Types.ObjectId(actorId),
  });

  return doc;
};

export const listStocks = async (query: Record<string, any>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(1, Math.min(Number(query.limit) || 20, 100));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.status) filter.status = query.status;
  if (query.lowStock === 'true') {
    filter.$expr = { $lte: ['$availableQuantity', '$minimumStockLevel'] };
  }
  if (query.search) {
    filter.$or = [
      { productName: { $regex: query.search, $options: 'i' } },
      { sku: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [rows, total] = await Promise.all([
    Stock.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Stock.countDocuments(filter),
  ]);

  return { data: rows, meta: { page, limit, total } };
};

export const getStockById = async (id: string) => {
  const doc = await Stock.findById(id);
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock item not found');
  }
  return doc;
};

export const updateStock = async (id: string, payload: UpdateStockDTO, actorId: string) => {
  const doc = await Stock.findByIdAndUpdate(id, { ...payload, updatedBy: new Types.ObjectId(actorId) }, { new: true, runValidators: true });
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock item not found');
  }
  return doc;
};

export const stockIn = async (id: string, payload: StockOperationDTO, actorId: string) => {
  const doc = await Stock.findById(id);
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock item not found');
  }

  doc.quantity += payload.quantity;
  const { availableQuantity } = recalculate(doc.quantity, doc.reservedQuantity);
  doc.availableQuantity = availableQuantity;
  doc.updatedBy = new Types.ObjectId(actorId);
  await doc.save();

  await StockMovementService.createMovement({
    stockId: String(doc._id),
    warehouseId: String(doc.warehouseId),
    type: 'IN',
    quantity: payload.quantity,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId,
    note: payload.note,
    createdBy: actorId,
  });

  return doc;
};

export const stockOut = async (id: string, payload: StockOperationDTO, actorId: string) => {
  const doc = await Stock.findById(id);
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock item not found');
  }

  if (doc.availableQuantity < payload.quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient available quantity');
  }

  doc.quantity -= payload.quantity;
  const { availableQuantity } = recalculate(doc.quantity, doc.reservedQuantity);
  doc.availableQuantity = availableQuantity;
  doc.updatedBy = new Types.ObjectId(actorId);
  await doc.save();

  await StockMovementService.createMovement({
    stockId: String(doc._id),
    warehouseId: String(doc.warehouseId),
    type: 'OUT',
    quantity: payload.quantity,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId,
    note: payload.note,
    createdBy: actorId,
  });

  return doc;
};

export const stockAdjust = async (id: string, payload: StockAdjustDTO, actorId: string) => {
  const doc = await Stock.findById(id);
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock item not found');
  }

  const nextQuantity = doc.quantity + payload.quantity;
  const { availableQuantity } = recalculate(nextQuantity, doc.reservedQuantity);

  doc.quantity = nextQuantity;
  doc.availableQuantity = availableQuantity;
  doc.updatedBy = new Types.ObjectId(actorId);
  await doc.save();

  await StockMovementService.createMovement({
    stockId: String(doc._id),
    warehouseId: String(doc.warehouseId),
    type: 'ADJUSTMENT',
    quantity: payload.quantity,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId,
    note: payload.note,
    createdBy: actorId,
  });

  return doc;
};

export const transferStock = async (payload: TransferStockDTO, actorId: string) => {
  await ensureWarehouseActive(payload.targetWarehouseId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const source = await Stock.findById(payload.sourceStockId).session(session);
    if (!source) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Source stock item not found');
    }

    if (String(source.warehouseId) === payload.targetWarehouseId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Source and target warehouse cannot be same');
    }

    if (source.availableQuantity < payload.quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient available quantity in source warehouse');
    }

    source.quantity -= payload.quantity;
    source.availableQuantity = recalculate(source.quantity, source.reservedQuantity).availableQuantity;
    source.updatedBy = new Types.ObjectId(actorId);
    await source.save({ session });

    let target = await Stock.findOne({ warehouseId: payload.targetWarehouseId, sku: source.sku }).session(session);

    if (!target) {
      target = await Stock.create(
        [
          {
            productName: source.productName,
            sku: source.sku,
            warehouseId: new Types.ObjectId(payload.targetWarehouseId),
            quantity: 0,
            reservedQuantity: 0,
            availableQuantity: 0,
            minimumStockLevel: source.minimumStockLevel,
            unit: source.unit,
            status: source.status,
            createdBy: new Types.ObjectId(actorId),
            updatedBy: new Types.ObjectId(actorId),
          },
        ],
        { session }
      ).then((rows) => rows[0]);
    }

    if (!target) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create target stock item');
    }

    target.quantity += payload.quantity;
    target.availableQuantity = recalculate(target.quantity, target.reservedQuantity).availableQuantity;
    target.updatedBy = new Types.ObjectId(actorId);
    await target.save({ session });

    await StockMovementService.createMovement(
      {
        stockId: String(source._id),
        warehouseId: String(source.warehouseId),
        type: 'TRANSFER_OUT',
        quantity: payload.quantity,
        referenceType: payload.referenceType || 'transfer',
        referenceId: payload.referenceId,
        note: payload.note,
        createdBy: actorId,
      },
      session
    );

    await StockMovementService.createMovement(
      {
        stockId: String(target._id),
        warehouseId: String(target.warehouseId),
        type: 'TRANSFER_IN',
        quantity: payload.quantity,
        referenceType: payload.referenceType || 'transfer',
        referenceId: payload.referenceId,
        note: payload.note,
        createdBy: actorId,
      },
      session
    );

    await session.commitTransaction();
    return { source, target };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const reserveStock = async (id: string, payload: StockOperationDTO, actorId: string) => {
  const doc = await Stock.findById(id);
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock item not found');
  }

  if (doc.availableQuantity < payload.quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient available quantity for reservation');
  }

  doc.reservedQuantity += payload.quantity;
  doc.availableQuantity = recalculate(doc.quantity, doc.reservedQuantity).availableQuantity;
  doc.updatedBy = new Types.ObjectId(actorId);
  await doc.save();

  await StockMovementService.createMovement({
    stockId: String(doc._id),
    warehouseId: String(doc.warehouseId),
    type: 'RESERVE',
    quantity: payload.quantity,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId,
    note: payload.note,
    createdBy: actorId,
  });

  return doc;
};

export const releaseStock = async (id: string, payload: StockOperationDTO, actorId: string) => {
  const doc = await Stock.findById(id);
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock item not found');
  }

  if (doc.reservedQuantity < payload.quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient reserved quantity to release');
  }

  doc.reservedQuantity -= payload.quantity;
  doc.availableQuantity = recalculate(doc.quantity, doc.reservedQuantity).availableQuantity;
  doc.updatedBy = new Types.ObjectId(actorId);
  await doc.save();

  await StockMovementService.createMovement({
    stockId: String(doc._id),
    warehouseId: String(doc.warehouseId),
    type: 'RELEASE',
    quantity: payload.quantity,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId,
    note: payload.note,
    createdBy: actorId,
  });

  return doc;
};

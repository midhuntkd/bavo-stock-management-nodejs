import httpStatus from 'http-status';
import { ClientSession, Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import Stock from './stock.model';
import { CreateStockDTO, StockDeltaInput } from './stock.types';

export const recalculateAvailableQuantity = (quantity: number, reservedQuantity: number, damagedQuantity: number) => {
  const availableQuantity = quantity - reservedQuantity - damagedQuantity;
  if (availableQuantity < 0 && !config.allowNegativeStock) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Available stock cannot be negative');
  }
  return availableQuantity;
};

const computeStatus = (availableQuantity: number, minStockLevel: number, forceInactive = false) => {
  if (forceInactive) return 'inactive' as const;
  if (availableQuantity <= 0) return 'outOfStock' as const;
  if (availableQuantity <= minStockLevel) return 'lowStock' as const;
  return 'inStock' as const;
};

export const createStockRecord = async (payload: CreateStockDTO) => {
  const exists = await Stock.findOne({
    productId: payload.productId,
    warehouseId: payload.warehouseId,
    locationId: payload.locationId || null,
  });
  if (exists) throw new ApiError(httpStatus.BAD_REQUEST, 'Stock record already exists for this product/warehouse/location');

  const quantity = payload.quantity || 0;
  const reservedQuantity = payload.reservedQuantity || 0;
  const damagedQuantity = payload.damagedQuantity || 0;
  const availableQuantity = recalculateAvailableQuantity(quantity, reservedQuantity, damagedQuantity);

  return Stock.create({
    productId: new Types.ObjectId(payload.productId),
    warehouseId: new Types.ObjectId(payload.warehouseId),
    locationId: payload.locationId ? new Types.ObjectId(payload.locationId) : null,
    quantity,
    reservedQuantity,
    damagedQuantity,
    availableQuantity,
    minStockLevel: payload.minStockLevel || 0,
    reorderLevel: payload.reorderLevel || 0,
    maxStockLevel: payload.maxStockLevel || 0,
    lastPurchasePrice: payload.lastPurchasePrice || 0,
    weightedAverageCost: payload.weightedAverageCost || 0,
    status: computeStatus(availableQuantity, payload.minStockLevel || 0),
  });
};

export const upsertStockSummary = async (
  keys: { productId: string; warehouseId: string; locationId?: string | null },
  initial: Partial<CreateStockDTO> = {},
  session?: ClientSession
) => {
  let stock = await Stock.findOne({ productId: keys.productId, warehouseId: keys.warehouseId, locationId: keys.locationId || null }).session(
    session || null
  );
  if (!stock) {
    stock = await Stock.create(
      [
        {
          productId: new Types.ObjectId(keys.productId),
          warehouseId: new Types.ObjectId(keys.warehouseId),
          locationId: keys.locationId ? new Types.ObjectId(keys.locationId) : null,
          quantity: initial.quantity || 0,
          reservedQuantity: initial.reservedQuantity || 0,
          damagedQuantity: initial.damagedQuantity || 0,
          availableQuantity: recalculateAvailableQuantity(
            initial.quantity || 0,
            initial.reservedQuantity || 0,
            initial.damagedQuantity || 0
          ),
          minStockLevel: initial.minStockLevel || 0,
          reorderLevel: initial.reorderLevel || 0,
          maxStockLevel: initial.maxStockLevel || 0,
          lastPurchasePrice: initial.lastPurchasePrice || 0,
          weightedAverageCost: initial.weightedAverageCost || 0,
          status: computeStatus(initial.quantity || 0, initial.minStockLevel || 0),
        },
      ],
      session ? { session } : undefined
    ).then((rows) => rows[0]);
  }
  return stock;
};

export const applyStockDelta = async (stockId: string, delta: StockDeltaInput, session?: ClientSession) => {
  const stock = await Stock.findById(stockId).session(session || null);
  if (!stock) throw new ApiError(httpStatus.NOT_FOUND, 'Stock not found');

  stock.quantity += delta.quantityDelta || 0;
  stock.reservedQuantity += delta.reservedDelta || 0;
  stock.damagedQuantity += delta.damagedDelta || 0;

  if (stock.quantity < 0 && !config.allowNegativeStock) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Stock quantity cannot be negative');
  }
  if (stock.reservedQuantity < 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Reserved quantity cannot be negative');
  if (stock.damagedQuantity < 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Damaged quantity cannot be negative');

  stock.availableQuantity = recalculateAvailableQuantity(stock.quantity, stock.reservedQuantity, stock.damagedQuantity);
  if (typeof delta.lastPurchasePrice !== 'undefined') stock.lastPurchasePrice = delta.lastPurchasePrice;
  if (typeof delta.weightedAverageCost !== 'undefined') stock.weightedAverageCost = delta.weightedAverageCost;

  stock.status = computeStatus(stock.availableQuantity, stock.minStockLevel, stock.status === 'inactive');
  await stock.save({ session });
  return stock;
};

export const listStocks = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.productId) filter.productId = query.productId;
  if (query.locationId) filter.locationId = query.locationId;
  if (query.status) filter.status = query.status;
  if (query.lowStock === 'true') filter.$expr = { $lte: ['$availableQuantity', '$minStockLevel'] };

  const [items, totalItems] = await Promise.all([
    Stock.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Stock.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 },
  };
};

export const getStockById = async (id: string) => {
  const stock = await Stock.findById(id);
  if (!stock) throw new ApiError(httpStatus.NOT_FOUND, 'Stock not found');
  return stock;
};

export const lowStockList = async (warehouseId?: string) => {
  const filter: any = { $expr: { $lte: ['$availableQuantity', '$minStockLevel'] } };
  if (warehouseId) filter.warehouseId = warehouseId;
  return Stock.find(filter).sort({ availableQuantity: 1, updatedAt: -1 });
};

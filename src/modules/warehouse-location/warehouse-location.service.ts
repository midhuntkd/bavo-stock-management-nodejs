import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import WarehouseLocation from './warehouse-location.model';

const getLocationCode = (payload: { zone: string; rack: string; shelf: string; bin: string }) =>
  `${payload.zone}-R${payload.rack}-S${payload.shelf}-B${payload.bin}`.toUpperCase();

export const createLocation = async (payload: any) => {
  const locationCode = (payload.locationCode || getLocationCode(payload)).toUpperCase();
  const exists = await WarehouseLocation.findOne({ warehouseId: payload.warehouseId, locationCode });
  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Location code already exists in warehouse');
  }
  return WarehouseLocation.create({ ...payload, locationCode });
};

export const listLocations = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';

  const [items, totalItems] = await Promise.all([
    WarehouseLocation.find(filter).sort({ priority: -1, createdAt: -1 }).skip(skip).limit(limit),
    WarehouseLocation.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit) || 1,
    },
  };
};

export const updateLocation = async (id: string, payload: any) => {
  if (payload.locationCode) payload.locationCode = payload.locationCode.toUpperCase();
  const doc = await WarehouseLocation.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse location not found');
  return doc;
};

export const setLocationActiveState = async (id: string, isActive: boolean) => {
  const doc = await WarehouseLocation.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse location not found');
  return doc;
};

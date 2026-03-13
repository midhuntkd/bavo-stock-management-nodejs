import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import Warehouse from './warehouse.model';
import { WarehouseCreateDTO, WarehouseUpdateDTO } from './warehouse.types';

export const createWarehouse = async (payload: WarehouseCreateDTO, actorId: string) => {
  const code = payload.code.toUpperCase();
  const exists = await Warehouse.findOne({ code });
  if (exists) throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse code already exists');

  return Warehouse.create({
    ...payload,
    code,
    createdBy: new Types.ObjectId(actorId),
    updatedBy: new Types.ObjectId(actorId),
  });
};

export const listWarehouses = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';
  if (query.type) filter.type = query.type;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { city: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    Warehouse.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Warehouse.countDocuments(filter),
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

export const getWarehouseById = async (id: string) => {
  const doc = await Warehouse.findById(id);
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');
  return doc;
};

export const updateWarehouse = async (id: string, payload: WarehouseUpdateDTO, actorId: string) => {
  const doc = await Warehouse.findById(id);
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');

  if (payload.code) {
    const code = payload.code.toUpperCase();
    const duplicate = await Warehouse.findOne({ code, _id: { $ne: id } });
    if (duplicate) throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse code already exists');
    payload.code = code;
  }

  Object.assign(doc, payload, { updatedBy: new Types.ObjectId(actorId) });
  await doc.save();
  return doc;
};

export const setWarehouseActiveState = async (id: string, isActive: boolean, actorId: string) => {
  const doc = await Warehouse.findByIdAndUpdate(
    id,
    { isActive, updatedBy: new Types.ObjectId(actorId) },
    { new: true, runValidators: true }
  );
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');
  return doc;
};

export const existsWarehouse = async (warehouseId: string) => {
  const exists = await Warehouse.exists({ _id: warehouseId, isActive: true });
  return !!exists;
};

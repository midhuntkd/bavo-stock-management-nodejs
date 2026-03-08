import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';
import Warehouse from './warehouse.model';
import { WarehouseCreateDTO, WarehouseUpdateDTO } from './warehouse.types';

export const createWarehouse = async (payload: WarehouseCreateDTO, actorId: string) => {
  const exists = await Warehouse.findOne({ code: payload.code.toUpperCase() });
  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse code already exists');
  }

  return Warehouse.create({
    ...payload,
    code: payload.code.toUpperCase(),
    createdBy: new Types.ObjectId(actorId),
  });
};

export const listWarehouses = async (query: Record<string, any>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(1, Math.min(Number(query.limit) || 20, 100));
  const skip = (page - 1) * limit;

  const filter: any = { isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { city: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [rows, total] = await Promise.all([
    Warehouse.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Warehouse.countDocuments(filter),
  ]);

  return { data: rows, meta: { page, limit, total } };
};

export const getWarehouseById = async (id: string) => {
  const doc = await Warehouse.findOne({ _id: id, isDeleted: false });
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');
  }
  return doc;
};

export const updateWarehouse = async (id: string, payload: WarehouseUpdateDTO) => {
  if (payload.code) {
    const codeExists = await Warehouse.findOne({ code: payload.code.toUpperCase(), _id: { $ne: id } });
    if (codeExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse code already exists');
    }
    payload.code = payload.code.toUpperCase();
  }

  const doc = await Warehouse.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true, runValidators: true });
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');
  }

  return doc;
};

export const deactivateWarehouse = async (id: string) => {
  const doc = await Warehouse.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { status: 'inactive', isDeleted: true },
    { new: true }
  );

  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');
  }

  return doc;
};

export const existsWarehouse = async (warehouseId: string) => {
  const exists = await Warehouse.exists({ _id: warehouseId, isDeleted: false, status: 'active' });
  return !!exists;
};

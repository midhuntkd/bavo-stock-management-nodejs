import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import Supplier from '../supplier/supplier.model';
import Brand from './brand.model';

const ensureSupplierExists = async (supplierId: string) => {
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid supplierId');
  }
  return supplier;
};

const normalizePayload = (payload: Record<string, any>) => {
  const next = { ...payload };
  if (typeof next.code === 'string') next.code = next.code.trim().toUpperCase();
  if (typeof next.slug === 'string') next.slug = next.slug.trim().toLowerCase();
  if (typeof next.name === 'string') next.name = next.name.trim();
  if (typeof next.companyExecutiveName === 'string') next.companyExecutiveName = next.companyExecutiveName.trim();
  if (typeof next.companyExecutiveNumber === 'string') next.companyExecutiveNumber = next.companyExecutiveNumber.trim();
  return next;
};

export const createBrand = async (payload: Record<string, any>, actorId: string) => {
  const next = normalizePayload(payload);
  await ensureSupplierExists(next.supplierId);

  const duplicate = await Brand.findOne({ supplierId: next.supplierId, name: next.name });
  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Brand already exists for this supplier');
  }

  return Brand.create({
    ...next,
    supplierId: new Types.ObjectId(next.supplierId),
    createdBy: new Types.ObjectId(actorId),
    updatedBy: new Types.ObjectId(actorId),
  });
};

export const listBrands = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);

  const filter: any = {};
  if (query.supplierId) filter.supplierId = query.supplierId;
  if (query.manufacturer) filter.manufacturer = { $regex: query.manufacturer, $options: 'i' };
  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { manufacturer: { $regex: query.search, $options: 'i' } },
      { category: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    Brand.find(filter).populate('supplierId', 'name code').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Brand.countDocuments(filter),
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

export const getBrandById = async (id: string) => {
  const brand = await Brand.findById(id).populate('supplierId', 'name code');
  if (!brand) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  return brand;
};

export const updateBrand = async (id: string, payload: Record<string, any>, actorId: string) => {
  const existing = await Brand.findById(id);
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');

  const next = normalizePayload(payload);

  if (next.supplierId) {
    await ensureSupplierExists(next.supplierId);
  }

  if (next.name || next.supplierId) {
    const duplicate = await Brand.findOne({
      _id: { $ne: id },
      supplierId: next.supplierId || existing.supplierId,
      name: next.name || existing.name,
    });
    if (duplicate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Brand already exists for this supplier');
    }
  }

  const updated = await Brand.findByIdAndUpdate(
    id,
    {
      ...next,
      ...(next.supplierId ? { supplierId: new Types.ObjectId(next.supplierId) } : {}),
      updatedBy: new Types.ObjectId(actorId),
    },
    { new: true, runValidators: true }
  ).populate('supplierId', 'name code');

  if (!updated) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  return updated;
};

export const updateBrandStatus = async (id: string, isActive: boolean, actorId: string) => {
  const updated = await Brand.findByIdAndUpdate(
    id,
    { isActive, updatedBy: new Types.ObjectId(actorId) },
    { new: true, runValidators: true }
  ).populate('supplierId', 'name code');

  if (!updated) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  return updated;
};

export const listBrandsBySupplier = async (supplierId: string) => {
  await ensureSupplierExists(supplierId);
  return Brand.find({ supplierId }).sort({ name: 1 });
};

export const listBrandOptions = async (query: Record<string, any>) => {
  const filter: any = { isActive: true };
  if (query.supplierId) filter.supplierId = query.supplierId;

  return Brand.find(filter)
    .select({ _id: 1, name: 1, code: 1, supplierId: 1, manufacturer: 1, companyExecutiveName: 1, companyExecutiveNumber: 1, category: 1 })
    .sort({ name: 1 })
    .lean();
};

export const getBrandByIdLean = async (id: string) => Brand.findById(id).lean();

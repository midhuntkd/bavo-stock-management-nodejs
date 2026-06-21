import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import Brand from '../brand/brand.model';
import Supplier from './supplier.model';

export const createSupplier = async (payload: any) => {
  const code = payload.code.toUpperCase();
  if (await Supplier.findOne({ code })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Supplier code already exists');
  }
  return Supplier.create({ ...payload, code });
};

export const listSuppliers = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { contactPerson: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Supplier.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 },
  };
};

export const listSupplierOptions = async (query: Record<string, any>) => {
  const filter: any = {};
  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { contactPerson: { $regex: query.search, $options: 'i' } },
    ];
  }

  return Supplier.find(filter)
    .select({ _id: 1, name: 1, code: 1, contactPerson: 1, phone: 1, email: 1, gstNo: 1, address: 1, isActive: 1 })
    .sort({ name: 1 })
    .lean();
};

export const getSupplierById = async (id: string, query?: Record<string, any>) => {
  const doc = await Supplier.findById(id);
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');

  const [brandCount, brands] = await Promise.all([
    Brand.countDocuments({ supplierId: doc._id }),
    query?.includeBrands === 'true' ? Brand.find({ supplierId: doc._id }).sort({ name: 1 }) : Promise.resolve(undefined),
  ]);

  const data: any = { ...doc.toObject(), brandCount };
  if (brands) data.brands = brands;
  return data;
};

export const updateSupplier = async (id: string, payload: any) => {
  if (payload.code) {
    const code = payload.code.toUpperCase();
    const duplicate = await Supplier.findOne({ code, _id: { $ne: id } });
    if (duplicate) throw new ApiError(httpStatus.BAD_REQUEST, 'Supplier code already exists');
    payload.code = code;
  }
  const doc = await Supplier.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
  return doc;
};

export const setSupplierActiveState = async (id: string, isActive: boolean) => {
  const doc = await Supplier.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
  return doc;
};

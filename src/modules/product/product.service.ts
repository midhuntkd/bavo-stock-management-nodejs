import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import { BrandService } from '../brand';
import Product from './product.model';

export const createProduct = async (payload: any) => {
  const slug = payload.slug.trim().toLowerCase();
  const sku = payload.sku.trim().toUpperCase();
  const nextPayload = { ...payload };

  if (nextPayload.brandId) {
    const brand = await BrandService.getBrandByIdLean(String(nextPayload.brandId));
    if (!brand) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid brandId');
    }

    // Auto-prefill manufacturer/category from brand if user did not pass explicit values.
    if (!nextPayload.manufacturer && brand.manufacturer) {
      nextPayload.manufacturer = brand.manufacturer;
    }
    if (!nextPayload.categoryId && brand.category) {
      nextPayload.categoryId = brand.category;
    }
  }

  if (await Product.findOne({ $or: [{ slug }, { sku }] })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product with same slug or sku already exists');
  }

  return Product.create({ ...nextPayload, slug, sku });
};

export const listProducts = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};

  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';
  if (typeof query.batchEnabled !== 'undefined') filter.batchEnabled = query.batchEnabled === 'true';
  if (typeof query.expiryEnabled !== 'undefined') filter.expiryEnabled = query.expiryEnabled === 'true';
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { sku: { $regex: query.search, $options: 'i' } },
      { barcode: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 },
  };
};

export const getProductById = async (id: string) => {
  const doc = await Product.findById(id);
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return doc;
};

export const updateProduct = async (id: string, payload: any) => {
  const nextPayload = { ...payload };
  if (nextPayload.slug) nextPayload.slug = nextPayload.slug.trim().toLowerCase();
  if (nextPayload.sku) nextPayload.sku = nextPayload.sku.trim().toUpperCase();

  if (nextPayload.brandId) {
    const brand = await BrandService.getBrandByIdLean(String(nextPayload.brandId));
    if (!brand) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid brandId');
    }
    if (!nextPayload.manufacturer && brand.manufacturer) {
      nextPayload.manufacturer = brand.manufacturer;
    }
    if (!nextPayload.categoryId && brand.category) {
      nextPayload.categoryId = brand.category;
    }
  }

  if (nextPayload.slug || nextPayload.sku) {
    const duplicate = await Product.findOne({
      _id: { $ne: id },
      $or: [
        ...(nextPayload.slug ? [{ slug: nextPayload.slug }] : []),
        ...(nextPayload.sku ? [{ sku: nextPayload.sku }] : []),
      ],
    });
    if (duplicate) throw new ApiError(httpStatus.BAD_REQUEST, 'Product with same slug or sku already exists');
  }

  const doc = await Product.findByIdAndUpdate(id, nextPayload, { new: true, runValidators: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return doc;
};

export const setProductActiveState = async (id: string, isActive: boolean) => {
  const doc = await Product.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return doc;
};

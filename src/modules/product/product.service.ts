import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import { BrandService } from '../brand';
import Product from './product.model';

const allowedUnits = new Set(['g', 'kg', 'ml', 'l', 'pc', 'pack', 'box']);

const extractOid = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.$oid === 'string') return value.$oid;
  return undefined;
};

const toBooleanStatus = (value: any) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'active';
  return true;
};

const toNumber = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const fallbackSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getPackSize = (item: Record<string, any>) => {
  if (typeof item.packSize === 'string' && item.packSize.trim()) return item.packSize.trim();

  const firstAttribute = Array.isArray(item.attributes) ? item.attributes.find((entry) => typeof entry?.value === 'string' && entry.value.trim()) : null;
  if (firstAttribute?.value) return String(firstAttribute.value).trim();

  if (typeof item.unitValue !== 'undefined' && typeof item.unit === 'string') {
    return `${item.unitValue} ${item.unit}`.trim();
  }

  return undefined;
};

const normalizeImportProduct = (item: Record<string, any>) => {
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const slug = typeof item.slug === 'string' && item.slug.trim() ? item.slug.trim().toLowerCase() : fallbackSlug(name);
  const sku = typeof item.sku === 'string' ? item.sku.trim().toUpperCase() : '';
  const unit = typeof item.unit === 'string' && allowedUnits.has(item.unit.trim().toLowerCase()) ? item.unit.trim().toLowerCase() : '';

  if (!name) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing name');
  if (!slug) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing slug');
  if (!sku) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing sku');
  if (!unit) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing or invalid unit');

  const price = toNumber(item.price, 0);
  const mrp = toNumber(item.mrp, price);
  const salePrice = toNumber(item.salePrice, price || mrp);
  const costPrice = toNumber(item.costPrice, salePrice || mrp);

  return {
    name,
    slug,
    sku,
    barcode: typeof item.barcode === 'string' ? item.barcode.trim() : undefined,
    categoryId: extractOid(item.categoryId) || extractOid(Array.isArray(item.parentCategory) ? item.parentCategory[0] : undefined) || (typeof item.categoryId === 'string' ? item.categoryId.trim() : undefined),
    manufacturer: typeof item.manufacturer === 'string' ? item.manufacturer.trim() : undefined,
    brandId: extractOid(item.brandId),
    unit,
    unitMeasurement: typeof item.unitMeasurement === 'string' ? item.unitMeasurement.trim() : undefined,
    unitValue: typeof item.unitValue !== 'undefined' ? toNumber(item.unitValue, 0) : undefined,
    availableQuantity: typeof item.availableQuantity !== 'undefined' ? toNumber(item.availableQuantity, 0) : toNumber(item.quantity, 0),
    packSize: getPackSize(item),
    hsnCode: typeof item.hsnCode === 'string' ? item.hsnCode.trim() : undefined,
    gstRate: toNumber(item.gstRate, 0),
    mrp,
    salePrice,
    costPrice,
    trackInventory: typeof item.trackInventory === 'boolean' ? item.trackInventory : true,
    batchEnabled: typeof item.batchEnabled === 'boolean' ? item.batchEnabled : false,
    expiryEnabled: typeof item.expiryEnabled === 'boolean' ? item.expiryEnabled : false,
    isActive: toBooleanStatus(typeof item.status !== 'undefined' ? item.status : item.isActive),
  };
};

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

export const importProducts = async (payload: any) => {
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.products) ? payload.products : null;
  if (!items) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expected a JSON array or an object with a products array');
  }

  const imported: Array<{ index: number; id: string; sku: string; slug: string }> = [];
  const skipped: Array<{ index: number; reason: string; sku?: string; slug?: string }> = [];

  for (const [index, rawItem] of items.entries()) {
    try {
      const normalized = normalizeImportProduct(rawItem || {});
      const created = await createProduct(normalized);
      imported.push({
        index,
        id: String((created as any)._id),
        sku: created.sku,
        slug: created.slug,
      });
    } catch (error: any) {
      skipped.push({
        index,
        sku: typeof rawItem?.sku === 'string' ? rawItem.sku : undefined,
        slug: typeof rawItem?.slug === 'string' ? rawItem.slug : undefined,
        reason: error?.message || 'Import failed',
      });
    }
  }

  return {
    total: items.length,
    importedCount: imported.length,
    skippedCount: skipped.length,
    imported,
    skipped,
  };
};

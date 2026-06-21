import httpStatus from 'http-status';
import { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import { BrandService } from '../brand';
import { Category } from '../category';
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

const normalizeCategoryAlias = (payload: Record<string, any>) => {
  const nextPayload = { ...payload };
  const category = extractOid(nextPayload.category);
  const categoryId = extractOid(nextPayload.categoryId);

  if (category && !categoryId) {
    nextPayload.categoryId = category;
  }

  delete nextPayload.category;
  return nextPayload;
};

const serializeProduct = (product: any) => {
  if (!product) return product;

  const normalized = typeof product.toObject === 'function' ? product.toObject() : { ...product };

  return {
    ...normalized,
    categoryId: normalized.categoryId ?? null,
    brandId: normalized.brandId ?? null,
  };
};

const shapePopulatedProduct = (product: any) => {
  const normalized = serializeProduct(product);

  return {
    ...normalized,
    brand: normalized.brandId || null,
    category: normalized.categoryId || null,
  };
};

const ensureCategoryExists = async (categoryId?: string) => {
  if (!categoryId) return;
  const category = await Category.findById(categoryId).lean();
  if (!category) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid categoryId');
  }
};

export const createProduct = async (payload: any) => {
  const slug = payload.slug.trim().toLowerCase();
  const sku = payload.sku.trim().toUpperCase();
  const nextPayload = normalizeCategoryAlias(payload);
  await ensureCategoryExists(nextPayload.categoryId);

  if (nextPayload.brandId) {
    const brand = await BrandService.getBrandByIdLean(String(nextPayload.brandId));
    if (!brand) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid brandId');
    }

    // Auto-prefill manufacturer/category from brand if user did not pass explicit values.
    if (!nextPayload.manufacturer && brand.manufacturer) {
      nextPayload.manufacturer = brand.manufacturer;
    }
  }

  if (await Product.findOne({ $or: [{ slug }, { sku }] })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product with same slug or sku already exists');
  }

  const created = await Product.create({
    ...nextPayload,
    ...(nextPayload.categoryId ? { categoryId: new Types.ObjectId(String(nextPayload.categoryId)) } : {}),
    slug,
    sku,
  });
  const doc = await Product.findById(created._id)
    .populate('brandId', 'name code slug manufacturer category logo isActive')
    .populate('categoryId', 'name slug status pageKey');
  return shapePopulatedProduct(doc);
};

export const listProducts = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};

  if (query.productId) filter._id = query.productId;
  const categoryId = extractOid(query.category) || extractOid(query.categoryId);
  if (query.brandId) filter.brandId = query.brandId;
  if (categoryId) filter.categoryId = categoryId;
  if (query.barcode) filter.barcode = query.barcode;
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
    Product.find(filter)
      .populate('brandId', 'name code slug manufacturer category logo isActive')
      .populate('categoryId', 'name slug status pageKey')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    items: items.map(shapePopulatedProduct),
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 },
  };
};

export const getProductById = async (id: string) => {
  const doc = await Product.findById(id)
    .populate('brandId', 'name code slug manufacturer category logo isActive')
    .populate('categoryId', 'name slug status pageKey');
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return shapePopulatedProduct(doc);
};

export const updateProduct = async (id: string, payload: any) => {
  const nextPayload = normalizeCategoryAlias(payload);
  if (nextPayload.slug) nextPayload.slug = nextPayload.slug.trim().toLowerCase();
  if (nextPayload.sku) nextPayload.sku = nextPayload.sku.trim().toUpperCase();
  await ensureCategoryExists(nextPayload.categoryId);

  if (nextPayload.brandId) {
    const brand = await BrandService.getBrandByIdLean(String(nextPayload.brandId));
    if (!brand) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid brandId');
    }
    if (!nextPayload.manufacturer && brand.manufacturer) {
      nextPayload.manufacturer = brand.manufacturer;
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

  const updateDoc = {
    ...nextPayload,
    ...(Object.prototype.hasOwnProperty.call(nextPayload, 'categoryId')
      ? { categoryId: nextPayload.categoryId ? new Types.ObjectId(String(nextPayload.categoryId)) : null }
      : {}),
  };

  const doc = await Product.findByIdAndUpdate(id, updateDoc, { new: true, runValidators: true })
    .populate('brandId', 'name code slug manufacturer category logo isActive')
    .populate('categoryId', 'name slug status pageKey');
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return shapePopulatedProduct(doc);
};

export const setProductActiveState = async (id: string, isActive: boolean) => {
  const doc = await Product.findByIdAndUpdate(id, { isActive }, { new: true })
    .populate('brandId', 'name code slug manufacturer category logo isActive')
    .populate('categoryId', 'name slug status pageKey');
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return shapePopulatedProduct(doc);
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

type RemoteStockSyncProduct = {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  unit: string;
  unitMeasurement?: string;
  unitValue?: number;
  availableQuantity?: number;
  packSize?: string;
  hsnCode?: string;
  gstRate?: number;
  mrp?: number;
  salePrice?: number;
  isActive?: boolean;
};

const normalizeStockSyncProduct = (item: RemoteStockSyncProduct) => {
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const slug =
    typeof item.slug === 'string' && item.slug.trim()
      ? item.slug.trim().toLowerCase()
      : fallbackSlug(name);
  const sku = typeof item.sku === 'string' ? item.sku.trim().toUpperCase() : '';
  const unit = typeof item.unit === 'string' && allowedUnits.has(item.unit.trim().toLowerCase()) ? item.unit.trim().toLowerCase() : '';

  if (!name) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing name');
  if (!slug) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing slug');
  if (!sku) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing sku');
  if (!unit) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing or invalid unit');

  const mrp = toNumber(item.mrp, 0);
  const salePrice = toNumber(item.salePrice, mrp);

  return {
    name,
    slug,
    sku,
    barcode: typeof item.barcode === 'string' ? item.barcode.trim() : undefined,
    unit,
    unitMeasurement: typeof item.unitMeasurement === 'string' ? item.unitMeasurement.trim() : undefined,
    unitValue: typeof item.unitValue !== 'undefined' ? toNumber(item.unitValue, 0) : undefined,
    availableQuantity: typeof item.availableQuantity !== 'undefined' ? toNumber(item.availableQuantity, 0) : 0,
    packSize: typeof item.packSize === 'string' ? item.packSize.trim() : undefined,
    hsnCode: typeof item.hsnCode === 'string' ? item.hsnCode.trim() : undefined,
    gstRate: typeof item.gstRate !== 'undefined' ? toNumber(item.gstRate, 0) : 0,
    mrp,
    salePrice,
    costPrice: salePrice,
    trackInventory: true,
    batchEnabled: false,
    expiryEnabled: false,
    isActive: Boolean(item.isActive),
  };
};

const fetchBavoAdminStockProducts = async (): Promise<RemoteStockSyncProduct[]> => {
  const { url, username, password, timeoutMs } = config.integrations.bavoAdminStockSync;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const basicToken = Buffer.from(`${username}:${password}`).toString('base64');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicToken}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(response.status || httpStatus.BAD_GATEWAY, `Bavo Admin sync failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      throw new ApiError(httpStatus.BAD_GATEWAY, 'Bavo Admin sync returned invalid payload');
    }

    return payload as RemoteStockSyncProduct[];
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new ApiError(httpStatus.GATEWAY_TIMEOUT, 'Bavo Admin sync request timed out');
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(httpStatus.BAD_GATEWAY, error?.message || 'Bavo Admin sync failed');
  } finally {
    clearTimeout(timeout);
  }
};

export const syncProductsFromBavoAdmin = async () => {
  const remoteItems = await fetchBavoAdminStockProducts();
  const created: Array<{ id: string; sku: string; slug: string }> = [];
  const updated: Array<{ id: string; sku: string; slug: string }> = [];
  const skipped: Array<{ index: number; sku?: string; slug?: string; reason: string }> = [];

  for (const [index, rawItem] of remoteItems.entries()) {
    try {
      const normalized = normalizeStockSyncProduct(rawItem || ({} as RemoteStockSyncProduct));
      const existing = await Product.findOne({ sku: normalized.sku });

      if (existing) {
        existing.mrp = normalized.mrp;
        existing.salePrice = normalized.salePrice;
        existing.availableQuantity = normalized.availableQuantity;
        existing.hsnCode = normalized.hsnCode;
        await existing.save();

        updated.push({
          id: String(existing._id),
          sku: existing.sku,
          slug: existing.slug,
        });
        continue;
      }

      const createdProduct = await createProduct(normalized);
      created.push({
        id: String((createdProduct as any)._id),
        sku: createdProduct.sku,
        slug: createdProduct.slug,
      });
    } catch (error: any) {
      skipped.push({
        index,
        sku: typeof rawItem?.sku === 'string' ? rawItem.sku : undefined,
        slug: typeof rawItem?.slug === 'string' ? rawItem.slug : undefined,
        reason: error?.message || 'Sync failed',
      });
    }
  }

  return {
    sourceUrl: config.integrations.bavoAdminStockSync.url,
    total: remoteItems.length,
    createdCount: created.length,
    updatedCount: updated.length,
    skippedCount: skipped.length,
    created,
    updated,
    skipped,
  };
};

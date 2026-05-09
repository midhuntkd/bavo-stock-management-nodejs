import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import Category from './category.model';

const normalizePayload = (payload: Record<string, any>) => {
  const next = { ...payload };
  if (typeof next.name === 'string') next.name = next.name.trim();
  if (typeof next.description === 'string') next.description = next.description.trim();
  if (typeof next.pageKey === 'string') next.pageKey = next.pageKey.trim();
  if (typeof next.slug === 'string') next.slug = next.slug.trim().toLowerCase();
  return next;
};

const ensureUniqueSlug = async (slug?: string, excludeId?: string) => {
  if (!slug) return;

  const duplicate = await Category.findOne({
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    slug,
  });

  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category with same slug already exists');
  }
};

export const createCategory = async (payload: Record<string, any>) => {
  const next = normalizePayload(payload);
  await ensureUniqueSlug(next.slug);
  return Category.create(next);
};

export const listCategories = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, any> = {};

  if (query.status) filter.status = query.status;
  if (query.pageKey) filter.pageKey = { $regex: query.pageKey, $options: 'i' };
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { pageKey: { $regex: query.search, $options: 'i' } },
      { slug: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    Category.find(filter).sort({ sortOrder: 1, name: 1, createdAt: -1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
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

export const getCategoryById = async (id: string) => {
  const doc = await Category.findById(id);
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  return doc;
};

export const updateCategory = async (id: string, payload: Record<string, any>) => {
  const next = normalizePayload(payload);
  await ensureUniqueSlug(next.slug, id);

  const doc = await Category.findByIdAndUpdate(id, next, { new: true, runValidators: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  return doc;
};

export const updateCategoryStatus = async (id: string, status: string) => {
  const doc = await Category.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  return doc;
};

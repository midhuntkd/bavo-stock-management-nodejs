import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { getDateRangeFromQuery, roundToCurrency } from '../accounting-dashboard/accounting.helper';
import ApiError from '../errors/ApiError';
import { getPagination } from '../utils';
import User from '../user/user.model';
import InHandAmount from './in-hand-amount.model';

const normalizePayload = (payload: Record<string, any>) => {
  const next = { ...payload };

  if (typeof next.orderID === 'string') next.orderID = next.orderID.trim();
  if (typeof next.description === 'string') next.description = next.description.trim();
  if (typeof next.amount !== 'undefined') next.amount = roundToCurrency(Number(next.amount));

  return next;
};

const ensureUserExists = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid userId');
  }
  return user;
};

export const createInHandAmount = async (payload: Record<string, any>, actorId: string) => {
  const next = normalizePayload(payload);
  await ensureUserExists(String(next.userId));

  return InHandAmount.create({
    userId: new Types.ObjectId(String(next.userId)),
    collectDate: new Date(next.collectDate),
    amount: next.amount,
    orderID: next.orderID || undefined,
    collectType: next.collectType,
    description: next.description,
    isActive: true,
    createdBy: new Types.ObjectId(actorId),
    updatedBy: new Types.ObjectId(actorId),
  });
};

export const createOwnInHandAmount = async (payload: Record<string, any>, userId: string) => {
  const next = normalizePayload(payload);
  await ensureUserExists(userId);

  return InHandAmount.create({
    userId: new Types.ObjectId(userId),
    collectDate: new Date(next.collectDate),
    amount: next.amount,
    orderID: next.orderID || undefined,
    collectType: next.collectType,
    description: next.description,
    isActive: true,
    createdBy: new Types.ObjectId(userId),
    updatedBy: new Types.ObjectId(userId),
  });
};

export const listInHandAmounts = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, any> = {
    isActive: true,
    ...getDateRangeFromQuery(query, 'collectDate'),
  };

  if (query.userId) filter.userId = query.userId;
  if (query.collectType) filter.collectType = query.collectType;
  if (query.search) {
    filter.$or = [
      { description: { $regex: query.search, $options: 'i' } },
      { orderID: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    InHandAmount.find(filter)
      .populate('userId', 'name email roleCode accessId')
      .populate('createdBy', 'name email roleCode')
      .populate('updatedBy', 'name email roleCode')
      .sort({ collectDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    InHandAmount.countDocuments(filter),
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

export const getInHandAmountById = async (id: string) => {
  const item = await InHandAmount.findById(id)
    .populate('userId', 'name email roleCode accessId')
    .populate('createdBy', 'name email roleCode')
    .populate('updatedBy', 'name email roleCode');

  if (!item || !item.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'In-hand amount record not found');
  }

  return item;
};

export const updateInHandAmount = async (id: string, payload: Record<string, any>, actorId: string) => {
  const next = normalizePayload(payload);
  const item = await InHandAmount.findById(id);

  if (!item || !item.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'In-hand amount record not found');
  }

  if (typeof next.userId !== 'undefined') {
    await ensureUserExists(String(next.userId));
    item.userId = new Types.ObjectId(String(next.userId));
  }

  if (typeof next.collectDate !== 'undefined') item.collectDate = new Date(next.collectDate);
  if (typeof next.amount !== 'undefined') item.amount = next.amount;
  if (typeof next.orderID !== 'undefined') item.orderID = next.orderID || undefined;
  if (typeof next.collectType !== 'undefined') item.collectType = next.collectType;
  if (typeof next.description !== 'undefined') item.description = next.description;
  item.updatedBy = new Types.ObjectId(actorId);

  await item.save();
  return getInHandAmountById(id);
};

export const deleteInHandAmount = async (id: string, actorId: string) => {
  const item = await InHandAmount.findById(id);

  if (!item || !item.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'In-hand amount record not found');
  }

  item.isActive = false;
  item.updatedBy = new Types.ObjectId(actorId);
  await item.save();

  return { _id: id };
};

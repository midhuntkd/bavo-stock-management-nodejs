import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';
import { getDateRangeFromQuery, isPrivilegedAccountingRole, roundToCurrency } from '../accounting-dashboard/accounting.helper';
import { getPagination } from '../utils';
import User from '../user/user.model';
import Account from '../account/account.model';
import PersonalSpend from './personal-spend.model';

type PersonalSpendActor = {
  userId: string;
  roleCode: string;
};

export const recalculatePersonalSpendStatus = (
  spend: { amount: number; clearedAmount: number; pendingAmount?: number },
  forceCarriedForward = false
) => {
  const clearedAmount = roundToCurrency(spend.clearedAmount);
  const pendingAmount = roundToCurrency(
    typeof spend.pendingAmount === 'number' ? spend.pendingAmount : roundToCurrency(spend.amount - clearedAmount)
  );

  if (pendingAmount <= 0) return 'cleared';
  if (forceCarriedForward) return 'carriedForward';
  if (clearedAmount > 0) return 'partiallyCleared';
  return 'pending';
};

const normalizePayload = (payload: Record<string, any>) => {
  const next = { ...payload };
  if (typeof next.description === 'string') next.description = next.description.trim();
  if (typeof next.vendorName === 'string') next.vendorName = next.vendorName.trim();
  if (typeof next.billNo === 'string') next.billNo = next.billNo.trim();
  if (typeof next.note === 'string') next.note = next.note.trim();
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

const ensureAccountExists = async (accountId: string) => {
  const account = await Account.findById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid companyAccountId');
  }
  return account;
};

const ensureActorAccess = (actor: PersonalSpendActor, ownerId: string) => {
  if (isPrivilegedAccountingRole(actor.roleCode)) return;
  if (actor.userId !== ownerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only access your own personal spends');
  }
};

export const createPersonalSpend = async (payload: Record<string, any>, actor: PersonalSpendActor) => {
  const next = normalizePayload(payload);
  const targetUserId = isPrivilegedAccountingRole(actor.roleCode) && next.userId ? String(next.userId) : actor.userId;
  await ensureUserExists(targetUserId);
  if (next.companyAccountId) {
    await ensureAccountExists(String(next.companyAccountId));
  }

  return PersonalSpend.create({
    ...next,
    userId: new Types.ObjectId(targetUserId),
    companyAccountId: next.companyAccountId ? new Types.ObjectId(String(next.companyAccountId)) : undefined,
    clearedAmount: 0,
    pendingAmount: next.amount,
    clearanceStatus: 'pending',
    isActive: true,
    createdBy: new Types.ObjectId(actor.userId),
    updatedBy: new Types.ObjectId(actor.userId),
  });
};

export const listPersonalSpends = async (query: Record<string, any>, actor: PersonalSpendActor) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, any> = {
    isActive: true,
    ...getDateRangeFromQuery(query, 'spendDate'),
  };

  if (query.userId && isPrivilegedAccountingRole(actor.roleCode)) {
    filter.userId = query.userId;
  }
  if (!isPrivilegedAccountingRole(actor.roleCode)) {
    filter.userId = actor.userId;
  }
  if (query.clearanceStatus) filter.clearanceStatus = query.clearanceStatus;
  if (query.spendType) filter.spendType = query.spendType;
  if (query.search) {
    filter.$or = [
      { description: { $regex: query.search, $options: 'i' } },
      { vendorName: { $regex: query.search, $options: 'i' } },
      { billNo: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    PersonalSpend.find(filter)
      .populate('userId', 'name email roleCode')
      .populate('companyAccountId', 'name code type currency')
      .sort({ spendDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PersonalSpend.countDocuments(filter),
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

export const getPersonalSpendById = async (id: string, actor: PersonalSpendActor) => {
  const spend = await PersonalSpend.findById(id)
    .populate('userId', 'name email roleCode')
    .populate('companyAccountId', 'name code type currency')
    .populate('createdBy', 'name email roleCode')
    .populate('updatedBy', 'name email roleCode');

  if (!spend || !spend.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Personal spend not found');
  }

  ensureActorAccess(actor, String((spend.userId as any)?._id || spend.userId));
  return spend;
};

export const updatePersonalSpend = async (id: string, payload: Record<string, any>, actor: PersonalSpendActor) => {
  const next = normalizePayload(payload);
  const spend = await PersonalSpend.findById(id);
  if (!spend || !spend.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Personal spend not found');
  }

  ensureActorAccess(actor, String(spend.userId));
  if (next.companyAccountId) {
    await ensureAccountExists(String(next.companyAccountId));
  }

  const nextAmount = typeof next.amount !== 'undefined' ? next.amount : spend.amount;
  if (nextAmount < spend.clearedAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Amount cannot be less than already cleared amount');
  }

  if (isPrivilegedAccountingRole(actor.roleCode) && typeof next.userId !== 'undefined') {
    await ensureUserExists(String(next.userId));
    spend.userId = new Types.ObjectId(String(next.userId));
  }

  if (typeof next.spendDate !== 'undefined') spend.spendDate = new Date(next.spendDate);
  if (typeof next.spendType !== 'undefined') spend.spendType = next.spendType;
  if (typeof next.amount !== 'undefined') spend.amount = next.amount;
  if (typeof next.paymentMode !== 'undefined') spend.paymentMode = next.paymentMode;
  if (typeof next.description !== 'undefined') spend.description = next.description;
  if (typeof next.vendorName !== 'undefined') spend.vendorName = next.vendorName;
  if (typeof next.billNo !== 'undefined') spend.billNo = next.billNo;
  if (typeof next.proof !== 'undefined') spend.proof = next.proof;
  if (typeof next.note !== 'undefined') spend.note = next.note;
  if (typeof next.companyAccountId !== 'undefined') {
    spend.companyAccountId = next.companyAccountId ? new Types.ObjectId(String(next.companyAccountId)) : undefined;
  }

  spend.pendingAmount = roundToCurrency(spend.amount - spend.clearedAmount);
  spend.clearanceStatus = recalculatePersonalSpendStatus(spend, spend.clearanceStatus === 'carriedForward') as any;
  spend.updatedBy = new Types.ObjectId(actor.userId);

  await spend.save();
  return getPersonalSpendById(id, actor);
};

export const deletePersonalSpend = async (id: string, actor: PersonalSpendActor) => {
  const spend = await PersonalSpend.findById(id);
  if (!spend || !spend.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Personal spend not found');
  }

  ensureActorAccess(actor, String(spend.userId));
  if (spend.clearedAmount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Personal spend cannot be deleted after reimbursement is applied');
  }

  spend.isActive = false;
  spend.updatedBy = new Types.ObjectId(actor.userId);
  await spend.save();
  return { _id: id };
};

export const markPersonalSpendCarriedForward = async (id: string, actor: PersonalSpendActor, note?: string) => {
  const spend = await PersonalSpend.findById(id);
  if (!spend || !spend.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Personal spend not found');
  }

  ensureActorAccess(actor, String(spend.userId));
  if (spend.pendingAmount <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only pending personal spend can be carried forward');
  }

  spend.clearanceStatus = 'carriedForward';
  if (typeof note === 'string') {
    spend.note = note.trim();
  }
  spend.updatedBy = new Types.ObjectId(actor.userId);
  await spend.save();
  return getPersonalSpendById(id, actor);
};
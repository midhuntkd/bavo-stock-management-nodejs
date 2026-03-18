import httpStatus from 'http-status';
import mongoose, { ClientSession, Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { getDateRangeFromQuery, roundToCurrency } from '../accounting-dashboard/accounting.helper';
import { getPagination, generateRunningNumber } from '../utils';
import PersonalSpend from '../personal-spend/personal-spend.model';
import { recalculatePersonalSpendStatus } from '../personal-spend/personal-spend.service';
import { applyAccountDebit, reverseAccountTransactionEffect } from '../account-transaction/account-transaction.service';
import Reimbursement from './reimbursement.model';

const ensurePersonalSpend = async (personalSpendId: string, session?: ClientSession) => {
  const query = PersonalSpend.findById(personalSpendId);
  if (session) query.session(session);
  const spend = await query;

  if (!spend || !spend.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Personal spend not found');
  }

  return spend;
};

const validateClearancePayload = (payload: Record<string, any>, pendingAmount: number) => {
  const clearedAmount = roundToCurrency(Number(payload.clearedAmount || 0));
  if (clearedAmount > pendingAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cleared amount cannot be greater than pending amount');
  }

  if (['partialClear', 'fullClear'].includes(payload.actionType) && !payload.accountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'accountId is required for company reimbursements');
  }

  if (['partialClear', 'fullClear'].includes(payload.actionType) && !payload.paymentMethod) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'paymentMethod is required for company reimbursements');
  }

  if (payload.actionType === 'fullClear' && clearedAmount !== pendingAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Full clear must settle the full pending amount');
  }

  if (payload.actionType === 'partialClear' && (clearedAmount <= 0 || clearedAmount >= pendingAmount)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Partial clear must clear a positive amount smaller than pending amount');
  }

  if (['extend', 'carryForward'].includes(payload.actionType) && clearedAmount !== 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Extend or carryForward cannot clear an amount');
  }

  return clearedAmount;
};

const applyReimbursementToDocument = async (
  reimbursement: any,
  personalSpend: any,
  payload: Record<string, any>,
  actorId: string,
  session: ClientSession
) => {
  const pendingAmountBefore = roundToCurrency(personalSpend.pendingAmount);
  const clearedAmount = validateClearancePayload(payload, pendingAmountBefore);
  const remainingAmount = roundToCurrency(pendingAmountBefore - clearedAmount);

  reimbursement.personalSpendId = personalSpend._id;
  reimbursement.userId = personalSpend.userId;
  reimbursement.accountId = payload.accountId ? new Types.ObjectId(String(payload.accountId)) : undefined;
  reimbursement.clearanceDate = new Date(payload.clearanceDate);
  reimbursement.clearedAmount = clearedAmount;
  reimbursement.remainingAmount = remainingAmount;
  reimbursement.actionType = payload.actionType;
  reimbursement.paymentMethod = payload.paymentMethod;
  reimbursement.note = payload.note;
  reimbursement.proof = payload.proof;
  reimbursement.status = 'active';
  reimbursement.createdBy = reimbursement.createdBy || new Types.ObjectId(actorId);

  if (clearedAmount > 0) {
    const accountTransaction = await applyAccountDebit(
      String(payload.accountId),
      {
        transactionDate: reimbursement.clearanceDate,
        type: 'debit',
        sourceType: 'reimbursementClearance',
        amount: clearedAmount,
        paymentMethod: payload.paymentMethod,
        referenceType: 'reimbursement',
        referenceId: reimbursement.reimbursementNo,
        description: `Reimbursement ${reimbursement.reimbursementNo}`,
        note: payload.note,
        proof: payload.proof,
        createdBy: actorId,
        approvedBy: actorId,
      },
      session
    );

    reimbursement.accountTransactionId = accountTransaction._id;
  } else {
    reimbursement.accountTransactionId = undefined;
  }

  personalSpend.clearedAmount = roundToCurrency(personalSpend.clearedAmount + clearedAmount);
  personalSpend.pendingAmount = roundToCurrency(personalSpend.amount - personalSpend.clearedAmount);
  personalSpend.companyAccountId = reimbursement.accountId;
  personalSpend.clearedAt = clearedAmount > 0 ? reimbursement.clearanceDate : personalSpend.clearedAt;
  personalSpend.clearanceStatus =
    payload.actionType === 'carryForward' || payload.actionType === 'extend'
      ? 'carriedForward'
      : recalculatePersonalSpendStatus(personalSpend);

  await personalSpend.save({ session });
  await reimbursement.save({ session });
  return reimbursement;
};

export const applyReimbursementClearance = async (payload: Record<string, any>, actorId: string, existingSession?: ClientSession) => {
  const session = existingSession || (await mongoose.startSession());
  if (!existingSession) session.startTransaction();

  try {
    const personalSpend = await ensurePersonalSpend(String(payload.personalSpendId), session);
    const reimbursement = new Reimbursement({
      reimbursementNo: await generateRunningNumber(config.numbering.reimbursementPrefix, 'reimbursement'),
      createdBy: new Types.ObjectId(actorId),
    });

    await applyReimbursementToDocument(reimbursement, personalSpend, payload, actorId, session);

    if (!existingSession) {
      await session.commitTransaction();
    }

    return getReimbursementById(String(reimbursement._id));
  } catch (error) {
    if (!existingSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (!existingSession) session.endSession();
  }
};

export const reverseReimbursementClearance = async (
  reimbursementId: string,
  actorId: string,
  existingSession?: ClientSession,
  markCancelled = true
) => {
  const session = existingSession || (await mongoose.startSession());
  if (!existingSession) session.startTransaction();

  try {
    const query = Reimbursement.findById(reimbursementId);
    query.session(session);
    const reimbursement = await query;
    if (!reimbursement) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Reimbursement not found');
    }

    if (reimbursement.status !== 'active') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Only active reimbursements can be reversed');
    }

    const personalSpend = await ensurePersonalSpend(String(reimbursement.personalSpendId), session);

    if (reimbursement.accountTransactionId) {
      await reverseAccountTransactionEffect(String(reimbursement.accountTransactionId), actorId, session, reimbursement.note);
      reimbursement.accountTransactionId = undefined;
    }

    personalSpend.clearedAmount = roundToCurrency(Math.max(0, personalSpend.clearedAmount - reimbursement.clearedAmount));
    personalSpend.pendingAmount = roundToCurrency(personalSpend.amount - personalSpend.clearedAmount);
    personalSpend.clearanceStatus = recalculatePersonalSpendStatus(personalSpend);
    if (personalSpend.pendingAmount > 0 && personalSpend.clearanceStatus === 'cleared') {
      personalSpend.clearanceStatus = 'pending';
    }
    await personalSpend.save({ session });

    if (markCancelled) {
      reimbursement.status = 'cancelled';
      await reimbursement.save({ session });
    }

    if (!existingSession) {
      await session.commitTransaction();
    }

    return reimbursement;
  } catch (error) {
    if (!existingSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (!existingSession) session.endSession();
  }
};

export const updateReimbursement = async (id: string, payload: Record<string, any>, actorId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = Reimbursement.findById(id);
    query.session(session);
    const reimbursement = await query;
    if (!reimbursement) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Reimbursement not found');
    }

    if (reimbursement.status !== 'active') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cancelled reimbursement cannot be updated');
    }

    await reverseReimbursementClearance(id, actorId, session, false);
    const personalSpend = await ensurePersonalSpend(String(reimbursement.personalSpendId), session);

    await applyReimbursementToDocument(
      reimbursement,
      personalSpend,
      {
        personalSpendId: String(reimbursement.personalSpendId),
        accountId: typeof payload.accountId !== 'undefined' ? payload.accountId : reimbursement.accountId,
        clearanceDate: payload.clearanceDate || reimbursement.clearanceDate,
        clearedAmount: typeof payload.clearedAmount !== 'undefined' ? payload.clearedAmount : reimbursement.clearedAmount,
        actionType: payload.actionType || reimbursement.actionType,
        paymentMethod: typeof payload.paymentMethod !== 'undefined' ? payload.paymentMethod : reimbursement.paymentMethod,
        note: typeof payload.note !== 'undefined' ? payload.note : reimbursement.note,
        proof: typeof payload.proof !== 'undefined' ? payload.proof : reimbursement.proof,
      },
      actorId,
      session
    );

    await session.commitTransaction();
    return getReimbursementById(id);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelReimbursement = async (id: string, actorId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await reverseReimbursementClearance(id, actorId, session, true);
    await session.commitTransaction();
    return getReimbursementById(id);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const listReimbursements = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, any> = {
    ...(query.status && query.status !== 'all' ? { status: query.status } : { status: 'active' }),
    ...getDateRangeFromQuery(query, 'clearanceDate'),
  };

  if (query.personalSpendId) filter.personalSpendId = query.personalSpendId;
  if (query.userId) filter.userId = query.userId;
  if (query.accountId) filter.accountId = query.accountId;
  if (query.actionType) filter.actionType = query.actionType;

  const [items, totalItems] = await Promise.all([
    Reimbursement.find(filter)
      .populate('personalSpendId')
      .populate('userId', 'name email roleCode')
      .populate('accountId', 'name code type currency')
      .populate('accountTransactionId')
      .sort({ clearanceDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Reimbursement.countDocuments(filter),
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

export const getReimbursementById = async (id: string) => {
  const reimbursement = await Reimbursement.findById(id)
    .populate('personalSpendId')
    .populate('userId', 'name email roleCode')
    .populate('accountId', 'name code type currency')
    .populate('accountTransactionId')
    .populate('createdBy', 'name email roleCode');

  if (!reimbursement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reimbursement not found');
  }

  return reimbursement;
};

export const getMonthlyReimbursementHistory = async (query: Record<string, any>) => {
  const match: Record<string, any> = { status: 'active', ...getDateRangeFromQuery(query, 'clearanceDate') };
  if (query.userId) match.userId = new Types.ObjectId(String(query.userId));

  const [monthlyItems, totals] = await Promise.all([
    Reimbursement.aggregate([
      { $match: match },
      { $sort: { clearanceDate: -1 } },
      {
        $project: {
          reimbursementNo: 1,
          personalSpendId: 1,
          userId: 1,
          accountId: 1,
          clearanceDate: 1,
          clearedAmount: 1,
          remainingAmount: 1,
          actionType: 1,
          paymentMethod: 1,
          note: 1,
        },
      },
    ]),
    Reimbursement.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$clearanceDate' } },
          totalClearedAmount: { $sum: '$clearedAmount' },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, month: '$_id', totalClearedAmount: 1, count: 1 } },
      { $sort: { month: 1 } },
    ]),
  ]);

  return {
    items: monthlyItems,
    totals,
  };
};
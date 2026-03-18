import httpStatus from 'http-status';
import mongoose, { ClientSession, Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { getDateRangeFromQuery, roundToCurrency } from '../accounting-dashboard/accounting.helper';
import { getPagination, generateRunningNumber } from '../utils';
import User from '../user/user.model';
import Account from '../account/account.model';
import { applyAccountCredit, reverseAccountTransactionEffect } from '../account-transaction/account-transaction.service';
import Investment from './investment.model';

const normalizePayload = (payload: Record<string, any>) => {
  const next = { ...payload };
  if (typeof next.category === 'string') next.category = next.category.trim();
  if (typeof next.vendorName === 'string') next.vendorName = next.vendorName.trim();
  if (typeof next.billNo === 'string') next.billNo = next.billNo.trim();
  if (typeof next.description === 'string') next.description = next.description.trim();
  if (typeof next.note === 'string') next.note = next.note.trim();
  if (typeof next.amount !== 'undefined') next.amount = roundToCurrency(Number(next.amount));
  return next;
};

const ensureInvestorExists = async (userId: string, session?: ClientSession) => {
  const query = User.findById(userId);
  if (session) query.session(session);
  const user = await query;
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid investorUserId');
  }
  return user;
};

const ensureAccountExists = async (accountId: string, session?: ClientSession) => {
  const query = Account.findById(accountId);
  if (session) query.session(session);
  const account = await query;
  if (!account) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid accountId');
  }
  return account;
};

const applyInvestmentEffectToDocument = async (investment: any, actorId: string, session: ClientSession) => {
  if (investment.affectsCompanyAccount) {
    if (!investment.accountId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'accountId is required when affectsCompanyAccount is true');
    }

    const transaction = await applyAccountCredit(
      String(investment.accountId),
      {
        transactionDate: investment.investmentDate,
        type: 'credit',
        sourceType: 'investment',
        amount: investment.amount,
        paymentMethod: investment.paymentMode,
        referenceType: 'investment',
        referenceId: investment.investmentNo,
        description: investment.description || `Investment ${investment.investmentNo}`,
        note: investment.note,
        proof: investment.proof,
        createdBy: actorId,
        approvedBy: actorId,
      },
      session
    );

    investment.accountTransactionId = transaction._id;
  } else {
    investment.accountTransactionId = undefined;
  }

  investment.status = 'confirmed';
  investment.updatedBy = new Types.ObjectId(actorId);
  await investment.save({ session });
  return investment;
};

export const createInvestment = async (payload: Record<string, any>, actorId: string) => {
  const next = normalizePayload(payload);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const investor = await ensureInvestorExists(String(next.investorUserId), session);
    if (next.accountId) {
      await ensureAccountExists(String(next.accountId), session);
    }

    if (next.affectsCompanyAccount && !next.accountId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'accountId is required when affectsCompanyAccount is true');
    }

    const investmentNo = await generateRunningNumber(config.numbering.investmentPrefix, 'investment');
    const status = next.status || 'draft';
    if (!['draft', 'confirmed'].includes(status)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status');
    }

    const investmentDocs = await Investment.create(
      [
        {
          ...next,
          investmentNo,
          investorUserId: new Types.ObjectId(String(next.investorUserId)),
          accountId: next.accountId ? new Types.ObjectId(String(next.accountId)) : undefined,
          roleSnapshot: investor.roleCode,
          status: 'draft',
          createdBy: new Types.ObjectId(actorId),
          updatedBy: new Types.ObjectId(actorId),
        },
      ],
      { session }
    );

    const investment = investmentDocs[0];
    if (status === 'confirmed') {
      await applyInvestmentEffectToDocument(investment, actorId, session);
    }

    await session.commitTransaction();
    return getInvestmentById(String(investment._id));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const listInvestments = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, any> = {
    ...getDateRangeFromQuery(query, 'investmentDate'),
  };

  if (query.investorUserId) filter.investorUserId = query.investorUserId;
  if (query.accountId) filter.accountId = query.accountId;
  if (query.status) filter.status = query.status;
  if (query.investmentType) filter.investmentType = query.investmentType;
  if (typeof query.affectsCompanyAccount !== 'undefined') {
    filter.affectsCompanyAccount = query.affectsCompanyAccount === 'true';
  }
  if (query.search) {
    filter.$or = [
      { investmentNo: { $regex: query.search, $options: 'i' } },
      { category: { $regex: query.search, $options: 'i' } },
      { vendorName: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    Investment.find(filter)
      .populate('investorUserId', 'name email roleCode')
      .populate('accountId', 'name code type currency')
      .populate('accountTransactionId')
      .sort({ investmentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Investment.countDocuments(filter),
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

export const getInvestmentById = async (id: string) => {
  const investment = await Investment.findById(id)
    .populate('investorUserId', 'name email roleCode')
    .populate('accountId', 'name code type currency')
    .populate('accountTransactionId')
    .populate('createdBy', 'name email roleCode')
    .populate('updatedBy', 'name email roleCode');

  if (!investment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Investment not found');
  }

  return investment;
};

export const confirmInvestmentEffect = async (investmentId: string, actorId: string, existingSession?: ClientSession) => {
  const session = existingSession || (await mongoose.startSession());
  if (!existingSession) session.startTransaction();

  try {
    const query = Investment.findById(investmentId);
    query.session(session);
    const investment = await query;
    if (!investment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Investment not found');
    }

    if (investment.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cancelled investment cannot be confirmed');
    }

    if (investment.status === 'confirmed') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Investment is already confirmed');
    }

    await applyInvestmentEffectToDocument(investment, actorId, session);

    if (!existingSession) {
      await session.commitTransaction();
    }

    return getInvestmentById(investmentId);
  } catch (error) {
    if (!existingSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (!existingSession) session.endSession();
  }
};

export const cancelInvestmentEffect = async (investmentId: string, actorId: string, existingSession?: ClientSession) => {
  const session = existingSession || (await mongoose.startSession());
  if (!existingSession) session.startTransaction();

  try {
    const query = Investment.findById(investmentId);
    query.session(session);
    const investment = await query;
    if (!investment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Investment not found');
    }

    if (investment.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Investment is already cancelled');
    }

    if (investment.status === 'confirmed' && investment.accountTransactionId) {
      await reverseAccountTransactionEffect(String(investment.accountTransactionId), actorId, session, investment.note);
      investment.accountTransactionId = undefined;
    }

    investment.status = 'cancelled';
    investment.updatedBy = new Types.ObjectId(actorId);
    await investment.save({ session });

    if (!existingSession) {
      await session.commitTransaction();
    }

    return getInvestmentById(investmentId);
  } catch (error) {
    if (!existingSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (!existingSession) session.endSession();
  }
};

export const updateInvestment = async (id: string, payload: Record<string, any>, actorId: string) => {
  const next = normalizePayload(payload);
  if (typeof next.status !== 'undefined') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Use dedicated confirm or cancel endpoints to change investment status');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = Investment.findById(id);
    query.session(session);
    const investment = await query;
    if (!investment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Investment not found');
    }

    if (investment.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cancelled investment cannot be updated');
    }

    const targetInvestorId = String(next.investorUserId || investment.investorUserId);
    const investor = await ensureInvestorExists(targetInvestorId, session);

    const targetAccountId = typeof next.accountId !== 'undefined' ? next.accountId : investment.accountId;
    const affectsCompanyAccount =
      typeof next.affectsCompanyAccount !== 'undefined' ? Boolean(next.affectsCompanyAccount) : investment.affectsCompanyAccount;

    if (targetAccountId) {
      await ensureAccountExists(String(targetAccountId), session);
    }

    if (affectsCompanyAccount && !targetAccountId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'accountId is required when affectsCompanyAccount is true');
    }

    if (investment.status === 'confirmed' && investment.accountTransactionId) {
      await reverseAccountTransactionEffect(String(investment.accountTransactionId), actorId, session, next.note || investment.note);
      investment.accountTransactionId = undefined;
    }

    if (typeof next.investorUserId !== 'undefined') investment.investorUserId = new Types.ObjectId(targetInvestorId);
    if (typeof next.investmentDate !== 'undefined') investment.investmentDate = new Date(next.investmentDate);
    if (typeof next.investmentType !== 'undefined') investment.investmentType = next.investmentType;
    if (typeof next.paymentMode !== 'undefined') investment.paymentMode = next.paymentMode;
    if (typeof next.amount !== 'undefined') investment.amount = next.amount;
    if (typeof next.accountId !== 'undefined') investment.accountId = next.accountId ? new Types.ObjectId(String(next.accountId)) : undefined;
    if (typeof next.affectsCompanyAccount !== 'undefined') investment.affectsCompanyAccount = affectsCompanyAccount;
    if (typeof next.category !== 'undefined') investment.category = next.category;
    if (typeof next.vendorName !== 'undefined') investment.vendorName = next.vendorName;
    if (typeof next.billNo !== 'undefined') investment.billNo = next.billNo;
    if (typeof next.description !== 'undefined') investment.description = next.description;
    if (typeof next.note !== 'undefined') investment.note = next.note;
    if (typeof next.proof !== 'undefined') investment.proof = next.proof;
    investment.roleSnapshot = investor.roleCode;
    investment.updatedBy = new Types.ObjectId(actorId);

    await investment.save({ session });

    if (investment.status === 'confirmed') {
      await applyInvestmentEffectToDocument(investment, actorId, session);
    }

    await session.commitTransaction();
    return getInvestmentById(id);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const deleteDraftInvestment = async (id: string) => {
  const investment = await Investment.findById(id);
  if (!investment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Investment not found');
  }

  if (investment.status !== 'draft') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft investments can be deleted');
  }

  await investment.deleteOne();
  return { _id: id };
};

export const getInvestmentSummary = async (query: Record<string, any>) => {
  const match: Record<string, any> = { status: 'confirmed', ...getDateRangeFromQuery(query, 'investmentDate') };
  if (query.investorUserId) match.investorUserId = new Types.ObjectId(String(query.investorUserId));

  const [overall, totalsByUser, totalsByMonth, affectingCompanyAccount, notDeposited] = await Promise.all([
    Investment.aggregate([
      { $match: match },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]),
    Investment.aggregate([
      { $match: match },
      { $group: { _id: '$investorUserId', totalAmount: { $sum: '$amount' } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, userId: '$_id', totalAmount: 1, userName: '$user.name', userEmail: '$user.email' } },
      { $sort: { totalAmount: -1 } },
    ]),
    Investment.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$investmentDate' } }, totalAmount: { $sum: '$amount' } } },
      { $project: { _id: 0, month: '$_id', totalAmount: 1 } },
      { $sort: { month: 1 } },
    ]),
    Investment.aggregate([
      { $match: { ...match, affectsCompanyAccount: true } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]),
    Investment.aggregate([
      { $match: { ...match, affectsCompanyAccount: false } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    totalInvestment: overall[0]?.totalAmount || 0,
    totalByUser: totalsByUser,
    totalByMonth: totalsByMonth,
    totalAffectingCompanyAccount: affectingCompanyAccount[0]?.totalAmount || 0,
    totalPersonalPaidButNotDeposited: notDeposited[0]?.totalAmount || 0,
  };
};
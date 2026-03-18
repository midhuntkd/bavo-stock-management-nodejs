import httpStatus from 'http-status';
import mongoose, { ClientSession, Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { getDateRangeFromQuery, roundToCurrency } from '../accounting-dashboard/accounting.helper';
import { getPagination } from '../utils';
import Account from '../account/account.model';
import {
  applyAccountDebit,
  getAccountTransactionById,
  reverseAccountTransactionEffect,
} from '../account-transaction/account-transaction.service';
import User from '../user/user.model';
import CompanyExpense from './company-expense.model';

const normalizePayload = (payload: Record<string, any>) => {
  const next = { ...payload };

  if (typeof next.vendorName === 'string') next.vendorName = next.vendorName.trim();
  if (typeof next.billNo === 'string') next.billNo = next.billNo.trim();
  if (typeof next.description === 'string') next.description = next.description.trim();
  if (typeof next.note === 'string') next.note = next.note.trim();
  if (typeof next.proof === 'string') next.proof = next.proof.trim();
  if (typeof next.referenceType === 'string') next.referenceType = next.referenceType.trim();
  if (typeof next.referenceId === 'string') next.referenceId = next.referenceId.trim();
  if (typeof next.amount !== 'undefined') next.amount = roundToCurrency(Number(next.amount));

  return next;
};

const ensureUserExists = async (userId: string, label: string, session?: ClientSession) => {
  const query = User.findById(userId);
  if (session) query.session(session);

  const user = await query;
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid ${label}`);
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

  if (!account.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Inactive account cannot be used for company expenses');
  }

  return account;
};

export const validateAccountDebitBalance = async (accountId: string, amount: number, session?: ClientSession) => {
  const account = await ensureAccountExists(accountId, session);
  if (!config.allowNegativeBalance && roundToCurrency(account.currentBalance - amount) < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient account balance');
  }
  return account;
};

export const createExpenseAccountTransaction = async (expense: any, actorId: string, session: ClientSession) => {
  if (!expense.affectsAccount) {
    expense.accountTransactionId = undefined;
    return undefined;
  }

  await validateAccountDebitBalance(String(expense.accountId), expense.amount, session);

  const transaction = await applyAccountDebit(
    String(expense.accountId),
    {
      transactionDate: expense.expenseDate,
      type: 'debit',
      sourceType: 'expense',
      subType: expense.expenseType,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      referenceType: 'companyExpense',
      referenceId: String(expense._id),
      description: expense.description,
      note: expense.note,
      proof: expense.proof,
      transferredByUserId: expense.transferredByUserId ? String(expense.transferredByUserId) : undefined,
      createdBy: actorId,
      approvedBy: expense.approvedBy ? String(expense.approvedBy) : actorId,
      allowNegativeBalance: config.allowNegativeBalance,
    },
    session
  );

  expense.accountTransactionId = transaction._id;
  return transaction;
};

export const confirmCompanyExpenseEffect = async (expenseId: string, actorId: string, existingSession?: ClientSession) => {
  const session = existingSession || (await mongoose.startSession());
  if (!existingSession) session.startTransaction();

  try {
    const query = CompanyExpense.findById(expenseId);
    query.session(session);
    const expense = await query;

    if (!expense) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Company expense not found');
    }

    if (expense.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cancelled company expense cannot be confirmed');
    }

    if (expense.status === 'confirmed') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Company expense is already confirmed');
    }

    await createExpenseAccountTransaction(expense, actorId, session);
    expense.status = 'confirmed';
    expense.approvedBy = expense.approvedBy || new Types.ObjectId(actorId);
    expense.updatedBy = new Types.ObjectId(actorId);
    await expense.save({ session });

    if (!existingSession) {
      await session.commitTransaction();
    }

    return getCompanyExpenseById(expenseId);
  } catch (error) {
    if (!existingSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (!existingSession) session.endSession();
  }
};

export const cancelCompanyExpenseEffect = async (
  expenseId: string,
  actorId: string,
  existingSession?: ClientSession,
  note?: string
) => {
  const session = existingSession || (await mongoose.startSession());
  if (!existingSession) session.startTransaction();

  try {
    const query = CompanyExpense.findById(expenseId);
    query.session(session);
    const expense = await query;

    if (!expense) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Company expense not found');
    }

    if (expense.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Company expense is already cancelled');
    }

    if (expense.status === 'confirmed' && expense.accountTransactionId) {
      await reverseAccountTransactionEffect(String(expense.accountTransactionId), actorId, session, note || expense.note);
      expense.accountTransactionId = undefined;
    }

    if (typeof note === 'string' && note.trim()) {
      expense.note = note.trim();
    }

    expense.status = 'cancelled';
    expense.updatedBy = new Types.ObjectId(actorId);
    await expense.save({ session });

    if (!existingSession) {
      await session.commitTransaction();
    }

    return getCompanyExpenseById(expenseId);
  } catch (error) {
    if (!existingSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (!existingSession) session.endSession();
  }
};

export const createCompanyExpense = async (payload: Record<string, any>, actorId: string) => {
  const next = normalizePayload(payload);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await ensureAccountExists(String(next.accountId), session);
    if (next.transferredByUserId) {
      await ensureUserExists(String(next.transferredByUserId), 'transferredByUserId', session);
    }
    if (next.approvedBy) {
      await ensureUserExists(String(next.approvedBy), 'approvedBy', session);
    }

    const status = next.status || 'draft';
    const expenseDocs = await CompanyExpense.create(
      [
        {
          ...next,
          accountId: new Types.ObjectId(String(next.accountId)),
          transferredByUserId: next.transferredByUserId ? new Types.ObjectId(String(next.transferredByUserId)) : undefined,
          approvedBy: next.approvedBy ? new Types.ObjectId(String(next.approvedBy)) : undefined,
          status: 'draft',
          createdBy: new Types.ObjectId(actorId),
          updatedBy: new Types.ObjectId(actorId),
        },
      ],
      { session }
    );

    const expense = expenseDocs[0];
    if (status === 'confirmed') {
      await createExpenseAccountTransaction(expense, actorId, session);
      expense.status = 'confirmed';
      expense.approvedBy = expense.approvedBy || new Types.ObjectId(actorId);
      await expense.save({ session });
    } else if (status === 'cancelled') {
      expense.status = 'cancelled';
      await expense.save({ session });
    }

    await session.commitTransaction();
    return getCompanyExpenseById(String(expense._id));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const listCompanyExpenses = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, any> = {
    ...getDateRangeFromQuery(query, 'expenseDate'),
  };

  if (query.accountId) filter.accountId = query.accountId;
  if (query.expenseType) filter.expenseType = query.expenseType;
  if (query.status && query.status !== 'all') filter.status = query.status;
  if (query.transferredByUserId) filter.transferredByUserId = query.transferredByUserId;
  if (query.createdBy) filter.createdBy = query.createdBy;
  if (query.search) {
    filter.$or = [
      { description: { $regex: query.search, $options: 'i' } },
      { vendorName: { $regex: query.search, $options: 'i' } },
      { billNo: { $regex: query.search, $options: 'i' } },
      { referenceId: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    CompanyExpense.find(filter)
      .populate('accountId', 'name code type currency currentBalance')
      .populate('transferredByUserId', 'name email roleCode')
      .populate('createdBy', 'name email roleCode')
      .populate('approvedBy', 'name email roleCode')
      .populate('accountTransactionId')
      .sort({ expenseDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CompanyExpense.countDocuments(filter),
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

export const getCompanyExpenseById = async (id: string) => {
  const expense = await CompanyExpense.findById(id)
    .populate('accountId', 'name code type currency currentBalance')
    .populate('transferredByUserId', 'name email roleCode')
    .populate('createdBy', 'name email roleCode')
    .populate('updatedBy', 'name email roleCode')
    .populate('approvedBy', 'name email roleCode')
    .populate('accountTransactionId');

  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company expense not found');
  }

  return expense;
};

export const updateCompanyExpense = async (id: string, payload: Record<string, any>, actorId: string) => {
  const next = normalizePayload(payload);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = CompanyExpense.findById(id);
    query.session(session);
    const expense = await query;

    if (!expense) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Company expense not found');
    }

    if (expense.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cancelled company expense cannot be updated');
    }

    const targetStatus = typeof next.status !== 'undefined' ? next.status : expense.status;
    const targetAccountId = typeof next.accountId !== 'undefined' ? next.accountId : expense.accountId;

    await ensureAccountExists(String(targetAccountId), session);
    if (next.transferredByUserId) {
      await ensureUserExists(String(next.transferredByUserId), 'transferredByUserId', session);
    }
    if (next.approvedBy) {
      await ensureUserExists(String(next.approvedBy), 'approvedBy', session);
    }

    if (expense.status === 'confirmed' && expense.accountTransactionId) {
      await reverseAccountTransactionEffect(String(expense.accountTransactionId), actorId, session, next.note || expense.note);
      expense.accountTransactionId = undefined;
    }

    if (typeof next.expenseDate !== 'undefined') expense.expenseDate = new Date(next.expenseDate);
    if (typeof next.accountId !== 'undefined') expense.accountId = new Types.ObjectId(String(targetAccountId));
    if (typeof next.expenseType !== 'undefined') expense.expenseType = next.expenseType;
    if (typeof next.amount !== 'undefined') expense.amount = next.amount;
    if (typeof next.paymentMethod !== 'undefined') expense.paymentMethod = next.paymentMethod;
    if (typeof next.vendorName !== 'undefined') expense.vendorName = next.vendorName;
    if (typeof next.billNo !== 'undefined') expense.billNo = next.billNo;
    if (typeof next.description !== 'undefined') expense.description = next.description;
    if (typeof next.note !== 'undefined') expense.note = next.note;
    if (typeof next.proof !== 'undefined') expense.proof = next.proof;
    if (typeof next.transferredByUserId !== 'undefined') {
      expense.transferredByUserId = next.transferredByUserId
        ? new Types.ObjectId(String(next.transferredByUserId))
        : undefined;
    }
    if (typeof next.approvedBy !== 'undefined') {
      expense.approvedBy = next.approvedBy ? new Types.ObjectId(String(next.approvedBy)) : undefined;
    }
    if (typeof next.affectsAccount !== 'undefined') expense.affectsAccount = Boolean(next.affectsAccount);
    if (typeof next.referenceType !== 'undefined') expense.referenceType = next.referenceType;
    if (typeof next.referenceId !== 'undefined') expense.referenceId = next.referenceId;
    expense.status = targetStatus === 'confirmed' ? 'draft' : targetStatus;
    expense.updatedBy = new Types.ObjectId(actorId);

    await expense.save({ session });

    if (targetStatus === 'confirmed') {
      await createExpenseAccountTransaction(expense, actorId, session);
      expense.status = 'confirmed';
      expense.approvedBy = expense.approvedBy || new Types.ObjectId(actorId);
      await expense.save({ session });
    }

    await session.commitTransaction();
    return getCompanyExpenseById(id);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const deleteDraftCompanyExpense = async (id: string) => {
  const expense = await CompanyExpense.findById(id);
  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company expense not found');
  }

  if (expense.status !== 'draft') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft company expenses can be deleted');
  }

  await expense.deleteOne();
  return { _id: id };
};

export const getCompanyExpenseLedgerReference = async (id: string) => {
  const expense = await CompanyExpense.findById(id);
  if (!expense || !expense.accountTransactionId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company expense ledger transaction not found');
  }

  return getAccountTransactionById(String(expense.accountTransactionId));
};
import httpStatus from 'http-status';
import mongoose, { ClientSession, Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { getDateRangeFromQuery, roundToCurrency } from '../accounting-dashboard/accounting.helper';
import { getPagination } from '../utils';
import Account from '../account/account.model';
import AccountTransaction from './account-transaction.model';
import {
  AccountTransactionPaymentMethod,
  AccountTransactionSourceType,
  AccountTransactionType,
  IAccountTransactionDoc,
} from './account-transaction.interface';

type FinancialMutationPayload = {
  transactionDate: Date | string;
  type: AccountTransactionType;
  sourceType: AccountTransactionSourceType;
  subType?: string;
  amount: number;
  paymentMethod: AccountTransactionPaymentMethod;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  note?: string;
  proof?: string;
  transferredByUserId?: string;
  createdBy: string;
  approvedBy?: string;
  allowNegativeBalance?: boolean;
};

const POSITIVE_TRANSACTION_TYPES: AccountTransactionType[] = ['credit', 'transfer_in', 'opening'];
const NEGATIVE_TRANSACTION_TYPES: AccountTransactionType[] = ['debit', 'transfer_out'];

const getAccountByIdForUpdate = async (accountId: string, session?: ClientSession) => {
  const query = Account.findById(accountId);
  if (session) query.session(session);

  const account = await query;
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  if (!account.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Inactive account cannot be used for transactions');
  }

  return account;
};

const normalizeTransactionDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid transactionDate');
  }
  return date;
};

const createTransactionRecord = async (
  accountId: string,
  balanceBefore: number,
  balanceAfter: number,
  payload: FinancialMutationPayload,
  session?: ClientSession,
  reversalOf?: Types.ObjectId
) => {
  const transaction = new AccountTransaction({
    accountId: new Types.ObjectId(accountId),
    transactionDate: normalizeTransactionDate(payload.transactionDate),
    type: payload.type,
    sourceType: payload.sourceType,
    subType: payload.subType,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId,
    amount: roundToCurrency(payload.amount),
    balanceBefore: roundToCurrency(balanceBefore),
    balanceAfter: roundToCurrency(balanceAfter),
    paymentMethod: payload.paymentMethod,
    description: payload.description,
    note: payload.note,
    proof: payload.proof,
    transferredByUserId: payload.transferredByUserId ? new Types.ObjectId(payload.transferredByUserId) : undefined,
    createdBy: new Types.ObjectId(payload.createdBy),
    approvedBy: payload.approvedBy ? new Types.ObjectId(payload.approvedBy) : undefined,
    reversalOf,
  });

  await transaction.save(session ? { session } : undefined);
  return transaction;
};

export const applyAccountCredit = async (accountId: string, payload: FinancialMutationPayload, session?: ClientSession) => {
  const account = await getAccountByIdForUpdate(accountId, session);
  const amount = roundToCurrency(payload.amount);
  if (amount < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Amount cannot be negative');
  }

  const balanceBefore = roundToCurrency(account.currentBalance);
  const balanceAfter = roundToCurrency(balanceBefore + amount);
  account.currentBalance = balanceAfter;
  await account.save(session ? { session } : undefined);

  return createTransactionRecord(accountId, balanceBefore, balanceAfter, payload, session);
};

export const applyAccountDebit = async (accountId: string, payload: FinancialMutationPayload, session?: ClientSession) => {
  const account = await getAccountByIdForUpdate(accountId, session);
  const amount = roundToCurrency(payload.amount);
  if (amount < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Amount cannot be negative');
  }

  const balanceBefore = roundToCurrency(account.currentBalance);
  const balanceAfter = roundToCurrency(balanceBefore - amount);
  const allowNegativeBalance = typeof payload.allowNegativeBalance === 'boolean' ? payload.allowNegativeBalance : config.allowNegativeBalance;
  if (balanceAfter < 0 && !allowNegativeBalance) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient account balance');
  }

  account.currentBalance = balanceAfter;
  await account.save(session ? { session } : undefined);

  return createTransactionRecord(accountId, balanceBefore, balanceAfter, payload, session);
};

const getOppositeTransactionType = (type: AccountTransactionType): AccountTransactionType => {
  switch (type) {
    case 'credit':
      return 'debit';
    case 'debit':
      return 'credit';
    case 'transfer_in':
      return 'transfer_out';
    case 'transfer_out':
      return 'transfer_in';
    case 'opening':
      return 'debit';
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unsupported transaction type for reversal');
  }
};

const isPositiveTransactionType = (type: AccountTransactionType) => POSITIVE_TRANSACTION_TYPES.includes(type);

export const reverseAccountTransactionEffect = async (
  transactionId: string,
  actorId: string,
  session?: ClientSession,
  note?: string
) => {
  const query = AccountTransaction.findById(transactionId);
  if (session) query.session(session);

  const transaction = await query;
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account transaction not found');
  }

  if (transaction.status === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account transaction is already cancelled');
  }

  const reverseType = getOppositeTransactionType(transaction.type);
  const reversePayload: FinancialMutationPayload = {
    transactionDate: new Date(),
    type: reverseType,
    sourceType: transaction.sourceType,
    subType: transaction.subType,
    amount: transaction.amount,
    paymentMethod: transaction.paymentMethod,
    referenceType: transaction.referenceType || 'accountTransaction',
    referenceId: String(transaction._id),
    description: `Reversal of ${transaction.referenceType || 'account transaction'}`,
    note: note || transaction.note,
    proof: transaction.proof,
    transferredByUserId: transaction.transferredByUserId ? String(transaction.transferredByUserId) : undefined,
    createdBy: actorId,
    approvedBy: actorId,
  };

  const reversal = isPositiveTransactionType(reverseType)
    ? await applyAccountCredit(String(transaction.accountId), reversePayload, session)
    : await applyAccountDebit(String(transaction.accountId), reversePayload, session);

  reversal.reversalOf = transaction._id as any;
  await reversal.save(session ? { session } : undefined);

  transaction.status = 'cancelled';
  transaction.cancelledAt = new Date();
  transaction.cancelledBy = new Types.ObjectId(actorId);
  await transaction.save(session ? { session } : undefined);

  return reversal;
};

const createManualTransactionInternal = async (
  payload: Record<string, any>,
  actorId: string,
  session?: ClientSession
) => {
  if (payload.type === 'opening') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Opening transactions are system generated only');
  }

  const transactionPayload: FinancialMutationPayload = {
    transactionDate: payload.transactionDate,
    type: payload.type,
    sourceType: payload.sourceType || 'manual',
    subType: payload.subType,
    amount: Number(payload.amount),
    paymentMethod: payload.paymentMethod,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId,
    description: payload.description,
    note: payload.note,
    proof: payload.proof,
    transferredByUserId: payload.transferredByUserId,
    createdBy: actorId,
    approvedBy: payload.approvedBy || actorId,
  };

  if (POSITIVE_TRANSACTION_TYPES.includes(transactionPayload.type)) {
    return applyAccountCredit(String(payload.accountId), transactionPayload, session);
  }

  if (NEGATIVE_TRANSACTION_TYPES.includes(transactionPayload.type)) {
    return applyAccountDebit(String(payload.accountId), transactionPayload, session);
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Unsupported transaction type');
};

export const createManualAccountTransaction = async (payload: Record<string, any>, actorId: string, session?: ClientSession) => {
  if (session) {
    return createManualTransactionInternal(payload, actorId, session);
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const transaction = await createManualTransactionInternal(payload, actorId, dbSession);
    await dbSession.commitTransaction();
    return getAccountTransactionById(String(transaction._id));
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
};

export const listAccountTransactions = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);

  const filter: Record<string, any> = {
    ...(query.status && query.status !== 'all' ? { status: query.status } : { status: 'active' }),
    ...getDateRangeFromQuery(query, 'transactionDate'),
  };

  if (query.accountId) filter.accountId = query.accountId;
  if (query.type) filter.type = query.type;
  if (query.sourceType) filter.sourceType = query.sourceType;
  if (query.subType) filter.subType = query.subType;
  if (query.referenceType) filter.referenceType = query.referenceType;
  if (query.referenceId) filter.referenceId = query.referenceId;
  if (query.transferredByUserId) filter.transferredByUserId = query.transferredByUserId;

  const [items, totalItems] = await Promise.all([
    AccountTransaction.find(filter)
      .populate('accountId', 'name code type currency currentBalance')
      .populate('transferredByUserId', 'name email roleCode')
      .populate('createdBy', 'name email roleCode')
      .populate('approvedBy', 'name email roleCode')
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AccountTransaction.countDocuments(filter),
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

export const getAccountTransactionById = async (id: string) => {
  const transaction = await AccountTransaction.findById(id)
    .populate('accountId', 'name code type currency currentBalance')
    .populate('transferredByUserId', 'name email roleCode')
    .populate('createdBy', 'name email roleCode')
    .populate('approvedBy', 'name email roleCode')
    .populate('cancelledBy', 'name email roleCode')
    .populate('reversalOf');

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account transaction not found');
  }

  return transaction;
};

const ensureManualTransaction = (transaction: IAccountTransactionDoc | null) => {
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account transaction not found');
  }

  if (transaction.sourceType !== 'manual') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only manual transactions can be edited');
  }

  if (transaction.type === 'opening') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Opening transactions cannot be edited');
  }

  if (transaction.status !== 'active') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only active transactions can be edited');
  }
};

export const updateManualAccountTransaction = async (id: string, payload: Record<string, any>, actorId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = AccountTransaction.findById(id);
    query.session(session);
    const transaction = await query;
    ensureManualTransaction(transaction);

    await reverseAccountTransactionEffect(id, actorId, session, payload.note || transaction!.note);

    const replacement = await createManualTransactionInternal(
      {
        accountId: payload.accountId || String(transaction!.accountId),
        transactionDate: payload.transactionDate || transaction!.transactionDate,
        type: payload.type || transaction!.type,
        sourceType: transaction!.sourceType,
        subType: typeof payload.subType !== 'undefined' ? payload.subType : transaction!.subType,
        amount: typeof payload.amount !== 'undefined' ? payload.amount : transaction!.amount,
        paymentMethod: payload.paymentMethod || transaction!.paymentMethod,
        referenceType: typeof payload.referenceType !== 'undefined' ? payload.referenceType : transaction!.referenceType,
        referenceId: typeof payload.referenceId !== 'undefined' ? payload.referenceId : transaction!.referenceId,
        description: typeof payload.description !== 'undefined' ? payload.description : transaction!.description,
        note: typeof payload.note !== 'undefined' ? payload.note : transaction!.note,
        proof: typeof payload.proof !== 'undefined' ? payload.proof : transaction!.proof,
        transferredByUserId:
          typeof payload.transferredByUserId !== 'undefined'
            ? payload.transferredByUserId
            : transaction!.transferredByUserId
              ? String(transaction!.transferredByUserId)
              : undefined,
        approvedBy: actorId,
      },
      actorId,
      session
    );

    await session.commitTransaction();
    return getAccountTransactionById(String(replacement._id));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelManualAccountTransaction = async (id: string, actorId: string, note?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = AccountTransaction.findById(id);
    query.session(session);
    const transaction = await query;
    ensureManualTransaction(transaction);

    await reverseAccountTransactionEffect(id, actorId, session, note);
    await session.commitTransaction();
    return getAccountTransactionById(id);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
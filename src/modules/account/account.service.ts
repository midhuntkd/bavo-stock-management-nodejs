import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { getDateRangeFromQuery, getSignedTransactionAmount, roundToCurrency } from '../accounting-dashboard/accounting.helper';
import { getPagination, generateRunningNumber } from '../utils';
import AccountTransaction from '../account-transaction/account-transaction.model';
import { applyAccountCredit } from '../account-transaction/account-transaction.service';
import Account from './account.model';

const normalizePayload = (payload: Record<string, any>) => {
  const next = { ...payload };
  if (typeof next.name === 'string') next.name = next.name.trim();
  if (typeof next.code === 'string') next.code = next.code.trim().toUpperCase();
  if (typeof next.bankName === 'string') next.bankName = next.bankName.trim();
  if (typeof next.accountNumber === 'string') next.accountNumber = next.accountNumber.trim();
  if (typeof next.ifsc === 'string') next.ifsc = next.ifsc.trim().toUpperCase();
  if (typeof next.branch === 'string') next.branch = next.branch.trim();
  if (typeof next.currency === 'string') next.currency = next.currency.trim().toUpperCase();
  if (typeof next.description === 'string') next.description = next.description.trim();
  if (typeof next.openingBalance !== 'undefined') next.openingBalance = roundToCurrency(Number(next.openingBalance));
  if (typeof next.currentBalance !== 'undefined') next.currentBalance = roundToCurrency(Number(next.currentBalance));
  return next;
};

const ensureUniqueAccount = async (payload: Record<string, any>, excludeId?: string) => {
  const filter: Record<string, any> = {
    name: payload.name,
    type: payload.type,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  };

  const duplicate = await Account.findOne(filter);
  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account already exists for the same name and type');
  }

  if (payload.code) {
    const duplicateCode = await Account.findOne({ code: payload.code, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (duplicateCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Account code already exists');
    }
  }
};

export const createAccount = async (payload: Record<string, any>, actorId: string) => {
  const next = normalizePayload(payload);
  await ensureUniqueAccount(next);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const code = next.code || (await generateRunningNumber(config.numbering.accountCodePrefix, 'account_code'));
    const openingBalance =
      typeof next.openingBalance === 'number'
        ? next.openingBalance
        : typeof next.currentBalance === 'number'
          ? next.currentBalance
          : 0;

    const account = await Account.create(
      [
        {
          ...next,
          code,
          openingBalance,
          currentBalance: 0,
          createdBy: new Types.ObjectId(actorId),
          updatedBy: new Types.ObjectId(actorId),
        },
      ],
      { session }
    );

    await applyAccountCredit(
      String(account[0]._id),
      {
        transactionDate: new Date(),
        type: 'opening',
        sourceType: 'manual',
        amount: openingBalance,
        paymentMethod: next.type === 'cash' ? 'cash' : 'bank',
        referenceType: 'account',
        referenceId: String(account[0]._id),
        description: 'Opening balance',
        note: next.description,
        createdBy: actorId,
        approvedBy: actorId,
      },
      session
    );

    await session.commitTransaction();
    return getAccountById(String(account[0]._id));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const listAccounts = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, any> = {};

  if (query.type) filter.type = query.type;
  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { bankName: { $regex: query.search, $options: 'i' } },
      { accountNumber: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    Account.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Account.countDocuments(filter),
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

export const getAccountById = async (id: string) => {
  const account = await Account.findById(id).populate('createdBy', 'name email').populate('updatedBy', 'name email');
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  return account;
};

export const updateAccount = async (id: string, payload: Record<string, any>, actorId: string) => {
  const account = await Account.findById(id);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  const next = normalizePayload(payload);
  if (typeof next.currentBalance !== 'undefined') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'currentBalance cannot be updated directly');
  }

  await ensureUniqueAccount(
    {
      name: next.name || account.name,
      type: next.type || account.type,
      code: next.code || account.code,
    },
    id
  );

  if (typeof next.openingBalance !== 'undefined' && next.openingBalance !== account.openingBalance) {
    const financialTransactions = await AccountTransaction.countDocuments({ accountId: id, type: { $ne: 'opening' } });
    if (financialTransactions > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Opening balance cannot be changed after financial activity has started');
    }

    const openingTransaction = await AccountTransaction.findOne({ accountId: id, type: 'opening', status: 'active' });
    if (!openingTransaction) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Opening transaction not found');
    }

    openingTransaction.amount = next.openingBalance;
    openingTransaction.balanceAfter = next.openingBalance;
    openingTransaction.note = next.description || openingTransaction.note;
    await openingTransaction.save();

    account.openingBalance = next.openingBalance;
    account.currentBalance = next.openingBalance;
  }

  if (typeof next.name !== 'undefined') account.name = next.name;
  if (typeof next.code !== 'undefined') account.code = next.code;
  if (typeof next.type !== 'undefined') account.type = next.type;
  if (typeof next.bankName !== 'undefined') account.bankName = next.bankName;
  if (typeof next.accountNumber !== 'undefined') account.accountNumber = next.accountNumber;
  if (typeof next.ifsc !== 'undefined') account.ifsc = next.ifsc;
  if (typeof next.branch !== 'undefined') account.branch = next.branch;
  if (typeof next.currency !== 'undefined') account.currency = next.currency;
  if (typeof next.description !== 'undefined') account.description = next.description;
  account.updatedBy = new Types.ObjectId(actorId);

  await account.save();
  return getAccountById(id);
};

export const updateAccountStatus = async (id: string, isActive: boolean, actorId: string) => {
  const account = await Account.findByIdAndUpdate(
    id,
    { isActive, updatedBy: new Types.ObjectId(actorId) },
    { new: true, runValidators: true }
  );

  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  return account;
};

export const generateAccountStatement = async (accountId: string, query: Record<string, any>) => {
  const account = await getAccountById(accountId);
  const dateFilter = getDateRangeFromQuery(query, 'transactionDate');
  const transactionFilter: Record<string, any> = { accountId, status: 'active', ...dateFilter };

  const transactions = await AccountTransaction.find(transactionFilter).sort({ transactionDate: 1, createdAt: 1 }).lean();
  let openingBalance = roundToCurrency(account.openingBalance);

  const startDate = dateFilter.transactionDate?.$gte;
  if (startDate) {
    const previousTransactions = await AccountTransaction.find({
      accountId,
      status: 'active',
      type: { $ne: 'opening' },
      transactionDate: { $lt: startDate },
    }).lean();

    openingBalance = roundToCurrency(
      openingBalance +
        previousTransactions.reduce((sum, transaction) => sum + getSignedTransactionAmount(transaction.type, transaction.amount), 0)
    );
  }

  const totalCredits = roundToCurrency(
    transactions
      .filter((transaction) => ['credit', 'transfer_in'].includes(transaction.type))
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  );
  const totalDebits = roundToCurrency(
    transactions
      .filter((transaction) => ['debit', 'transfer_out'].includes(transaction.type))
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  );
  const closingBalance = roundToCurrency(openingBalance + totalCredits - totalDebits);

  return {
    account,
    openingBalance,
    totalCredits,
    totalDebits,
    closingBalance,
    currentBalance: account.currentBalance,
    transactions,
  };
};

export const getAccountSummary = async (query: Record<string, any>) => {
  const accountFilter: Record<string, any> = {};
  if (typeof query.isActive !== 'undefined') accountFilter.isActive = query.isActive === 'true';
  if (query.type) accountFilter.type = query.type;

  const accounts = await Account.find(accountFilter).sort({ name: 1 }).lean();
  const statements = await Promise.all(accounts.map((account) => generateAccountStatement(String(account._id), query)));

  return {
    items: statements.map((statement) => ({
      _id: statement.account._id,
      name: statement.account.name,
      code: statement.account.code,
      type: statement.account.type,
      currency: statement.account.currency,
      isActive: statement.account.isActive,
      openingBalance: statement.openingBalance,
      totalCredits: statement.totalCredits,
      totalDebits: statement.totalDebits,
      closingBalance: statement.closingBalance,
      currentBalance: statement.currentBalance,
    })),
    totalCompanyBalance: roundToCurrency(statements.reduce((sum, statement) => sum + statement.currentBalance, 0)),
  };
};
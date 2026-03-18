import { Types } from 'mongoose';
import { getMonthDateRange, roundToCurrency } from './accounting.helper';
import Account from '../account/account.model';
import AccountTransaction from '../account-transaction/account-transaction.model';
import CompanyExpense from '../company-expense/company-expense.model';
import Investment from '../investment/investment.model';
import PersonalSpend from '../personal-spend/personal-spend.model';
import Reimbursement from '../reimbursement/reimbursement.model';
import { generateAccountStatement } from '../account/account.service';

const getMonthlyUserSpendRows = async (start: Date, end: Date) => {
  return PersonalSpend.aggregate([
    {
      $match: {
        isActive: true,
        spendDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$userId',
        totalPersonalSpend: { $sum: '$amount' },
        clearedAmount: { $sum: '$clearedAmount' },
        pendingAmount: { $sum: '$pendingAmount' },
        carryForwardAmount: {
          $sum: {
            $cond: [{ $eq: ['$clearanceStatus', 'carriedForward'] }, '$pendingAmount', 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        userName: '$user.name',
        userEmail: '$user.email',
        roleCode: '$user.roleCode',
        totalPersonalSpend: 1,
        clearedAmount: 1,
        pendingAmount: 1,
        carryForwardAmount: 1,
      },
    },
    { $sort: { totalPersonalSpend: -1 } },
  ]);
};

export const getAccountingDashboardSummary = async () => {
  const now = new Date();
  const { start, end } = getMonthDateRange(now.getUTCMonth() + 1, now.getUTCFullYear());

  const [
    totalInvestments,
    totalInvestmentsByUser,
    totalCompanyAccountBalance,
    totalCompanyExpensesThisMonth,
    expenseByTypeThisMonth,
    totalPendingPersonalSpend,
    totalClearedThisMonth,
    totalPendingReimbursementByUser,
    accountWiseCurrentBalances,
  ] = await Promise.all([
    Investment.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, totalAmount: { $sum: '$amount' } } }]),
    Investment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$investorUserId', totalAmount: { $sum: '$amount' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, userId: '$_id', userName: '$user.name', userEmail: '$user.email', totalAmount: 1 } },
      { $sort: { totalAmount: -1 } },
    ]),
    Account.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, totalAmount: { $sum: '$currentBalance' } } }]),
    CompanyExpense.aggregate([
      { $match: { status: 'confirmed', expenseDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]),
    CompanyExpense.aggregate([
      { $match: { status: 'confirmed', expenseDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$expenseType', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $project: { _id: 0, expenseType: '$_id', totalAmount: 1, count: 1 } },
      { $sort: { totalAmount: -1 } },
    ]),
    PersonalSpend.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, totalAmount: { $sum: '$pendingAmount' } } }]),
    Reimbursement.aggregate([
      { $match: { status: 'active', clearanceDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalAmount: { $sum: '$clearedAmount' } } },
    ]),
    PersonalSpend.aggregate([
      { $match: { isActive: true, pendingAmount: { $gt: 0 } } },
      { $group: { _id: '$userId', totalPendingAmount: { $sum: '$pendingAmount' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, userId: '$_id', userName: '$user.name', userEmail: '$user.email', totalPendingAmount: 1 } },
      { $sort: { totalPendingAmount: -1 } },
    ]),
    Account.find({ isActive: true }).select({ name: 1, code: 1, type: 1, currentBalance: 1, currency: 1 }).sort({ name: 1 }).lean(),
  ]);

  return {
    totalInvestments: totalInvestments[0]?.totalAmount || 0,
    totalInvestmentsByUser,
    totalCompanyAccountBalance: totalCompanyAccountBalance[0]?.totalAmount || 0,
    totalCompanyExpensesThisMonth: totalCompanyExpensesThisMonth[0]?.totalAmount || 0,
    expenseByTypeThisMonth,
    totalPendingPersonalSpend: totalPendingPersonalSpend[0]?.totalAmount || 0,
    totalClearedAmountThisMonth: totalClearedThisMonth[0]?.totalAmount || 0,
    totalPendingReimbursementByUser,
    accountWiseCurrentBalances,
  };
};

export const generateMonthlyAccountingSummary = async (month: number, year: number) => {
  const { start, end } = getMonthDateRange(month, year);

  const [
    monthlySpendSummaryByUser,
    monthlyInvestmentSummary,
    monthlyCashInOut,
    accountList,
    monthlyCompanyExpenses,
    companyExpenseByType,
    companyExpenseByAccount,
    companyExpenseByTransferredByUser,
    companyExpenseByCreatedByAdmin,
  ] = await Promise.all([
    getMonthlyUserSpendRows(start, end),
    Investment.aggregate([
      { $match: { status: 'confirmed', investmentDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$investorUserId',
          totalAmount: { $sum: '$amount' },
          affectingCompanyAccount: {
            $sum: {
              $cond: ['$affectsCompanyAccount', '$amount', 0],
            },
          },
          personalContribution: {
            $sum: {
              $cond: ['$affectsCompanyAccount', 0, '$amount'],
            },
          },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, userId: '$_id', userName: '$user.name', totalAmount: 1, affectingCompanyAccount: 1, personalContribution: 1 } },
      { $sort: { totalAmount: -1 } },
    ]),
    AccountTransaction.aggregate([
      { $match: { status: 'active', transactionDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalCashIn: {
            $sum: {
              $cond: [{ $in: ['$type', ['credit', 'transfer_in']] }, '$amount', 0],
            },
          },
          totalCashOut: {
            $sum: {
              $cond: [{ $in: ['$type', ['debit', 'transfer_out']] }, '$amount', 0],
            },
          },
        },
      },
    ]),
    Account.find({ isActive: true }).select({ _id: 1 }).lean(),
    CompanyExpense.aggregate([
      { $match: { status: 'confirmed', expenseDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]),
    CompanyExpense.aggregate([
      { $match: { status: 'confirmed', expenseDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$expenseType', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $project: { _id: 0, expenseType: '$_id', totalAmount: 1, count: 1 } },
      { $sort: { totalAmount: -1 } },
    ]),
    CompanyExpense.aggregate([
      { $match: { status: 'confirmed', expenseDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$accountId', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'accounts', localField: '_id', foreignField: '_id', as: 'account' } },
      { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          accountId: '$_id',
          accountName: '$account.name',
          accountCode: '$account.code',
          accountType: '$account.type',
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),
    CompanyExpense.aggregate([
      { $match: { status: 'confirmed', expenseDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$transferredByUserId', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),
    CompanyExpense.aggregate([
      { $match: { status: 'confirmed', expenseDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$createdBy', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),
  ]);

  const accountStatements = await Promise.all(
    accountList.map((account) => generateAccountStatement(String(account._id), { startDate: start.toISOString(), endDate: end.toISOString() }))
  );

  const monthlySpendSummaryTotal = monthlySpendSummaryByUser.reduce(
    (acc, item) => ({
      totalPersonalSpend: acc.totalPersonalSpend + item.totalPersonalSpend,
      clearedAmount: acc.clearedAmount + item.clearedAmount,
      pendingAmount: acc.pendingAmount + item.pendingAmount,
      carryForwardAmount: acc.carryForwardAmount + item.carryForwardAmount,
    }),
    { totalPersonalSpend: 0, clearedAmount: 0, pendingAmount: 0, carryForwardAmount: 0 }
  );

  const getExpenseTotal = (expenseTypes: string[]) =>
    roundToCurrency(
      companyExpenseByType
        .filter((item) => expenseTypes.includes(item.expenseType))
        .reduce((sum, item) => sum + item.totalAmount, 0)
    );

  return {
    month,
    year,
    periodStart: start,
    periodEnd: end,
    monthlySpendSummaryByUser,
    monthlySpendSummaryTotal,
    monthlyInvestmentSummary,
    monthlyCashIn: monthlyCashInOut[0]?.totalCashIn || 0,
    monthlyCashOut: monthlyCashInOut[0]?.totalCashOut || 0,
    totalCompanyExpenses: roundToCurrency(monthlyCompanyExpenses[0]?.totalAmount || 0),
    companyExpenseByType,
    companyExpenseByAccount,
    companyExpenseByTransferredByUser,
    companyExpenseByCreatedByAdmin,
    salaryTotal: getExpenseTotal(['salary']),
    utilityBillTotal: getExpenseTotal(['electricityBill', 'waterBill', 'governmentBill', 'internetPhone']),
    stockPurchaseTotal: getExpenseTotal(['stockPurchase']),
    officeEssentialsTotal: getExpenseTotal(['officeEssentials']),
    miscellaneousTotal: getExpenseTotal(['miscellaneous', 'other']),
    accountStatements: accountStatements.map((statement) => ({
      accountId: statement.account._id,
      accountName: statement.account.name,
      accountCode: statement.account.code,
      type: statement.account.type,
      currency: statement.account.currency,
      openingBalance: statement.openingBalance,
      totalCredits: statement.totalCredits,
      totalDebits: statement.totalDebits,
      closingBalance: statement.closingBalance,
    })),
  };
};

export const getUserAccountingSummary = async (userId: string, month: number, year: number) => {
  const { start, end } = getMonthDateRange(month, year);

  const [spendSummaryRows, investmentSummary, reimbursements, pendingSpend] = await Promise.all([
    getMonthlyUserSpendRows(start, end),
    Investment.aggregate([
      {
        $match: {
          status: 'confirmed',
          investorUserId: new Types.ObjectId(userId),
          investmentDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          affectingCompanyAccount: { $sum: { $cond: ['$affectsCompanyAccount', '$amount', 0] } },
          personalContribution: { $sum: { $cond: ['$affectsCompanyAccount', 0, '$amount'] } },
        },
      },
    ]),
    Reimbursement.aggregate([
      {
        $match: {
          status: 'active',
          userId: new Types.ObjectId(userId),
          clearanceDate: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, totalClearedAmount: { $sum: '$clearedAmount' } } },
    ]),
    PersonalSpend.aggregate([
      {
        $match: {
          isActive: true,
          userId: new Types.ObjectId(userId),
          spendDate: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, totalPendingAmount: { $sum: '$pendingAmount' }, carryForwardAmount: { $sum: { $cond: [{ $eq: ['$clearanceStatus', 'carriedForward'] }, '$pendingAmount', 0] } } } },
    ]),
  ]);

  const spendSummary = spendSummaryRows.find((row) => String(row.userId) === userId) || {
    userId,
    totalPersonalSpend: 0,
    clearedAmount: 0,
    pendingAmount: 0,
    carryForwardAmount: 0,
  };

  return {
    month,
    year,
    userId,
    totalPersonalSpend: roundToCurrency(spendSummary.totalPersonalSpend || 0),
    clearedAmount: roundToCurrency(spendSummary.clearedAmount || 0),
    pendingAmount: roundToCurrency((pendingSpend[0]?.totalPendingAmount || spendSummary.pendingAmount) || 0),
    carryForwardAmount: roundToCurrency((pendingSpend[0]?.carryForwardAmount || spendSummary.carryForwardAmount) || 0),
    totalInvestment: roundToCurrency(investmentSummary[0]?.totalAmount || 0),
    investmentAffectingCompanyAccount: roundToCurrency(investmentSummary[0]?.affectingCompanyAccount || 0),
    personalContribution: roundToCurrency(investmentSummary[0]?.personalContribution || 0),
    totalReimbursedThisMonth: roundToCurrency(reimbursements[0]?.totalClearedAmount || 0),
  };
};
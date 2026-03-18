import { Document, Model, Types } from 'mongoose';

export const COMPANY_EXPENSE_TYPES = [
  'stockPurchase',
  'salary',
  'officeEssentials',
  'electricityBill',
  'waterBill',
  'governmentBill',
  'rent',
  'maintenance',
  'internetPhone',
  'transport',
  'fuel',
  'courier',
  'miscellaneous',
  'other',
] as const;

export const COMPANY_EXPENSE_PAYMENT_METHODS = ['cash', 'bank', 'upi', 'card', 'cheque', 'other'] as const;
export const COMPANY_EXPENSE_STATUSES = ['draft', 'confirmed', 'cancelled'] as const;

export type CompanyExpenseType = (typeof COMPANY_EXPENSE_TYPES)[number];
export type CompanyExpensePaymentMethod = (typeof COMPANY_EXPENSE_PAYMENT_METHODS)[number];
export type CompanyExpenseStatus = (typeof COMPANY_EXPENSE_STATUSES)[number];

export interface ICompanyExpense {
  expenseDate: Date;
  accountId: Types.ObjectId;
  expenseType: CompanyExpenseType;
  amount: number;
  paymentMethod: CompanyExpensePaymentMethod;
  vendorName?: string;
  billNo?: string;
  description: string;
  note?: string;
  proof?: string;
  transferredByUserId?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  status: CompanyExpenseStatus;
  affectsAccount: boolean;
  referenceType?: string;
  referenceId?: string;
  accountTransactionId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyExpenseDoc extends ICompanyExpense, Document {}
export interface ICompanyExpenseModel extends Model<ICompanyExpenseDoc> {}
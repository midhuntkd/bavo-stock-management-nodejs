import { Document, Model, Types } from 'mongoose';

export type PersonalSpendType =
  | 'fuel'
  | 'travel'
  | 'food'
  | 'courier'
  | 'officeExpense'
  | 'billPayment'
  | 'materialPurchase'
  | 'maintenance'
  | 'other';
export type PersonalSpendPaymentMode = 'cash' | 'bank' | 'upi' | 'card' | 'other';
export type PersonalSpendClearanceStatus = 'pending' | 'partiallyCleared' | 'cleared' | 'carriedForward';

export interface IPersonalSpend {
  userId: Types.ObjectId;
  spendDate: Date;
  spendType: PersonalSpendType;
  amount: number;
  paymentMode: PersonalSpendPaymentMode;
  description: string;
  vendorName?: string;
  billNo?: string;
  proof?: string;
  note?: string;
  clearanceStatus: PersonalSpendClearanceStatus;
  clearedAmount: number;
  pendingAmount: number;
  companyAccountId?: Types.ObjectId;
  clearedAt?: Date;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPersonalSpendDoc extends IPersonalSpend, Document {}
export interface IPersonalSpendModel extends Model<IPersonalSpendDoc> {}
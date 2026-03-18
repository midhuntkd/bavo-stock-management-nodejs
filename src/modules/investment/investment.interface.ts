import { Document, Model, Types } from 'mongoose';

export type InvestmentType =
  | 'cashDeposit'
  | 'bankDeposit'
  | 'billPayment'
  | 'materialPurchase'
  | 'expensePaid'
  | 'assetPurchase'
  | 'other';
export type InvestmentPaymentMode = 'cash' | 'bank' | 'upi' | 'card' | 'cheque' | 'other';
export type InvestmentStatus = 'draft' | 'confirmed' | 'cancelled';

export interface IInvestment {
  investmentNo: string;
  investorUserId: Types.ObjectId;
  roleSnapshot?: string;
  investmentDate: Date;
  investmentType: InvestmentType;
  paymentMode: InvestmentPaymentMode;
  amount: number;
  accountId?: Types.ObjectId;
  affectsCompanyAccount: boolean;
  category?: string;
  vendorName?: string;
  billNo?: string;
  description?: string;
  note?: string;
  proof?: string;
  status: InvestmentStatus;
  accountTransactionId?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvestmentDoc extends IInvestment, Document {}
export interface IInvestmentModel extends Model<IInvestmentDoc> {}
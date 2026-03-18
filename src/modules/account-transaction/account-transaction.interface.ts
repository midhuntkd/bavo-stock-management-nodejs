import { Document, Model, Types } from 'mongoose';

export type AccountTransactionType = 'credit' | 'debit' | 'transfer_in' | 'transfer_out' | 'opening';
export type AccountTransactionSourceType =
  | 'investment'
  | 'expense'
  | 'sale'
  | 'purchase'
  | 'salary'
  | 'bill'
  | 'bankDeposit'
  | 'bankWithdrawal'
  | 'reimbursementClearance'
  | 'manual'
  | 'transfer';
export type AccountTransactionPaymentMethod = 'cash' | 'bank' | 'upi' | 'card' | 'cheque' | 'other';
export type AccountTransactionStatus = 'active' | 'cancelled';

export interface IAccountTransaction {
  accountId: Types.ObjectId;
  transactionDate: Date;
  type: AccountTransactionType;
  sourceType: AccountTransactionSourceType;
  referenceType?: string;
  referenceId?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  paymentMethod: AccountTransactionPaymentMethod;
  description?: string;
  note?: string;
  proof?: string;
  status: AccountTransactionStatus;
  createdBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  cancelledBy?: Types.ObjectId;
  cancelledAt?: Date;
  reversalOf?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountTransactionDoc extends IAccountTransaction, Document {}
export interface IAccountTransactionModel extends Model<IAccountTransactionDoc> {}
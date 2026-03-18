import { Document, Model, Types } from 'mongoose';

export type ReimbursementActionType = 'partialClear' | 'fullClear' | 'extend' | 'carryForward';
export type ReimbursementPaymentMethod = 'cash' | 'bank' | 'upi' | 'card' | 'other';
export type ReimbursementStatus = 'active' | 'cancelled';

export interface IReimbursement {
  reimbursementNo: string;
  personalSpendId: Types.ObjectId;
  userId: Types.ObjectId;
  accountId?: Types.ObjectId;
  clearanceDate: Date;
  clearedAmount: number;
  remainingAmount: number;
  actionType: ReimbursementActionType;
  paymentMethod?: ReimbursementPaymentMethod;
  note?: string;
  proof?: string;
  status: ReimbursementStatus;
  accountTransactionId?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReimbursementDoc extends IReimbursement, Document {}
export interface IReimbursementModel extends Model<IReimbursementDoc> {}
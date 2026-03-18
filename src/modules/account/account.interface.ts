import { Document, Model, Types } from 'mongoose';

export type AccountType = 'cash' | 'bank' | 'wallet' | 'upi' | 'other';

export interface IAccount {
  name: string;
  code?: string;
  type: AccountType;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountDoc extends IAccount, Document {}
export interface IAccountModel extends Model<IAccountDoc> {}
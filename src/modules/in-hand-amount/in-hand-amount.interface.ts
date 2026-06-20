import { Document, Model, Types } from 'mongoose';

export const IN_HAND_AMOUNT_COLLECT_TYPES = ['order', 'purchase', 'other'] as const;

export type InHandAmountCollectType = (typeof IN_HAND_AMOUNT_COLLECT_TYPES)[number];

export interface IInHandAmount {
  userId: Types.ObjectId;
  collectDate: Date;
  amount: number;
  orderID?: string;
  collectType: InHandAmountCollectType;
  description: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInHandAmountDoc extends IInHandAmount, Document {}
export interface IInHandAmountModel extends Model<IInHandAmountDoc> {}

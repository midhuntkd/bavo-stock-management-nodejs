import { Document, Model, Types } from 'mongoose';

export interface IBrand {
  name: string;
  code?: string;
  slug?: string;
  supplierId: Types.ObjectId;
  manufacturer?: string;
  category?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrandDoc extends IBrand, Document {}
export interface IBrandModel extends Model<IBrandDoc> {}

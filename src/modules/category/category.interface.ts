import { Document, Model } from 'mongoose';

export type CategoryStatus = 'Active' | 'Inactive' | 'Delete';

export interface ICategory {
  name: string;
  description?: string;
  pageKey?: string;
  slug?: string;
  sortOrder: number;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDoc extends ICategory, Document {}
export interface ICategoryModel extends Model<ICategoryDoc> {}

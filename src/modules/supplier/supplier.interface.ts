import { Document, Model } from 'mongoose';

export interface ISupplier {
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstNo?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplierDoc extends ISupplier, Document {}
export interface ISupplierModel extends Model<ISupplierDoc> {}

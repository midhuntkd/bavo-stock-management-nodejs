import { Document, Model } from 'mongoose';

export interface IWarehouse {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contactName?: string;
  contactPhone?: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWarehouseDoc extends IWarehouse, Document {}

export interface IWarehouseModel extends Model<IWarehouseDoc> {}

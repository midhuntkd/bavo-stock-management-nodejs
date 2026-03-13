import { Document, Model, Types } from 'mongoose';

export type WarehouseType = 'darkStore' | 'mainWarehouse' | 'miniWarehouse' | 'store';

export interface IWarehouse {
  name: string;
  code: string;
  type: WarehouseType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contactName?: string;
  contactPhone?: string;
  serviceArea?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWarehouseDoc extends IWarehouse, Document {}
export interface IWarehouseModel extends Model<IWarehouseDoc> {}

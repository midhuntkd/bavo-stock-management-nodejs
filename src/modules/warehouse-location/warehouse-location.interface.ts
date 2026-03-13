import { Document, Model, Types } from 'mongoose';

export interface IWarehouseLocation {
  warehouseId: Types.ObjectId;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  locationCode: string;
  isPickable: boolean;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWarehouseLocationDoc extends IWarehouseLocation, Document {}
export interface IWarehouseLocationModel extends Model<IWarehouseLocationDoc> {}

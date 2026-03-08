import { Document, Model, Types } from 'mongoose';

export interface IStock {
  productName: string;
  sku: string;
  warehouseId: Types.ObjectId;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStockLevel: number;
  unit: string;
  status: 'active' | 'inactive';
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockDoc extends IStock, Document {}

export interface IStockModel extends Model<IStockDoc> {}

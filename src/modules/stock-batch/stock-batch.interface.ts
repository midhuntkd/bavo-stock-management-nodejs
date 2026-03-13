import { Document, Model, Types } from 'mongoose';

export type StockBatchStatus = 'active' | 'expired' | 'damaged' | 'blocked';

export interface IStockBatch {
  stockId: Types.ObjectId;
  productId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  locationId?: Types.ObjectId;
  batchNo: string;
  lotNo?: string;
  mfgDate?: Date;
  expiryDate?: Date;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  purchasePrice: number;
  salePrice: number;
  mrp: number;
  status: StockBatchStatus;
  supplierId?: Types.ObjectId;
  grnId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockBatchDoc extends IStockBatch, Document {}
export interface IStockBatchModel extends Model<IStockBatchDoc> {}

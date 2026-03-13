import { Document, Model, Types } from 'mongoose';

export interface IStockAdjustment {
  adjustmentNo: string;
  warehouseId: Types.ObjectId;
  reason: 'damage' | 'expiry' | 'manualCorrection' | 'theft' | 'countMismatch';
  note?: string;
  status: 'draft' | 'applied';
  createdBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockAdjustmentItem {
  adjustmentId: Types.ObjectId;
  stockId: Types.ObjectId;
  batchId?: Types.ObjectId;
  expectedQty: number;
  actualQty: number;
  differenceQty: number;
  note?: string;
}

export interface IStockAdjustmentDoc extends IStockAdjustment, Document {}
export interface IStockAdjustmentModel extends Model<IStockAdjustmentDoc> {}

export interface IStockAdjustmentItemDoc extends IStockAdjustmentItem, Document {}
export interface IStockAdjustmentItemModel extends Model<IStockAdjustmentItemDoc> {}

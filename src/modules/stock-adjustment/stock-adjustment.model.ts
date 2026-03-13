import mongoose, { Schema } from 'mongoose';
import {
  IStockAdjustmentDoc,
  IStockAdjustmentItemDoc,
  IStockAdjustmentItemModel,
  IStockAdjustmentModel,
} from './stock-adjustment.interface';

const stockAdjustmentSchema = new Schema<IStockAdjustmentDoc, IStockAdjustmentModel>(
  {
    adjustmentNo: { type: String, required: true, unique: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    reason: { type: String, enum: ['damage', 'expiry', 'manualCorrection', 'theft', 'countMismatch'], required: true },
    note: { type: String },
    status: { type: String, enum: ['draft', 'applied'], default: 'draft', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

const stockAdjustmentItemSchema = new Schema<IStockAdjustmentItemDoc, IStockAdjustmentItemModel>(
  {
    adjustmentId: { type: Schema.Types.ObjectId, ref: 'StockAdjustment', required: true, index: true },
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'StockBatch' },
    expectedQty: { type: Number, required: true },
    actualQty: { type: Number, required: true },
    differenceQty: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: true, versionKey: false }
);

stockAdjustmentItemSchema.index({ adjustmentId: 1, stockId: 1, batchId: 1 });

export const StockAdjustment = mongoose.model<IStockAdjustmentDoc, IStockAdjustmentModel>('StockAdjustment', stockAdjustmentSchema);
export const StockAdjustmentItem = mongoose.model<IStockAdjustmentItemDoc, IStockAdjustmentItemModel>(
  'StockAdjustmentItem',
  stockAdjustmentItemSchema
);

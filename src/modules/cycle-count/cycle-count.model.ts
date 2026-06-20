import mongoose, { Schema } from 'mongoose';
import {
  ICycleCountDoc,
  ICycleCountItemDoc,
  ICycleCountItemModel,
  ICycleCountModel,
} from './cycle-count.interface';

const cycleCountSchema = new Schema<ICycleCountDoc, ICycleCountModel>(
  {
    countNo: { type: String, required: true, unique: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'WarehouseLocation', default: null, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['draft', 'inProgress', 'submitted', 'reconciled'],
      default: 'draft',
      index: true,
    },
    blindAudit: { type: Boolean, default: false },
    note: { type: String },
    scheduledDate: { type: Date },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    reconciledAt: { type: Date },
    adjustmentId: { type: Schema.Types.ObjectId, ref: 'StockAdjustment', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reconciledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

cycleCountSchema.index({ warehouseId: 1, status: 1 });
cycleCountSchema.index({ warehouseId: 1, scheduledDate: 1 });

const cycleCountItemSchema = new Schema<ICycleCountItemDoc, ICycleCountItemModel>(
  {
    cycleCountId: { type: Schema.Types.ObjectId, ref: 'CycleCount', required: true, index: true },
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'StockBatch', default: null },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    systemQty: { type: Number, required: true },
    countedQty: { type: Number, default: null },
    variance: { type: Number, default: null },
    note: { type: String },
  },
  { timestamps: true, versionKey: false }
);

cycleCountItemSchema.index({ cycleCountId: 1, stockId: 1 });

export const CycleCount = mongoose.model<ICycleCountDoc, ICycleCountModel>('CycleCount', cycleCountSchema);
export const CycleCountItem = mongoose.model<ICycleCountItemDoc, ICycleCountItemModel>('CycleCountItem', cycleCountItemSchema);

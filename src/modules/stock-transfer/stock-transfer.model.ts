import mongoose, { Schema } from 'mongoose';
import {
  IStockTransferDoc,
  IStockTransferItemDoc,
  IStockTransferItemModel,
  IStockTransferModel,
} from './stock-transfer.interface';

const stockTransferSchema = new Schema<IStockTransferDoc, IStockTransferModel>(
  {
    transferNumber: { type: String, required: true, unique: true, index: true },
    fromWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    toWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    status: { type: String, enum: ['draft', 'inTransit', 'received', 'cancelled'], default: 'draft', index: true },
    transferDate: { type: Date, required: true },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

const stockTransferItemSchema = new Schema<IStockTransferItemDoc, IStockTransferItemModel>(
  {
    transferId: { type: Schema.Types.ObjectId, ref: 'StockTransfer', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'StockBatch' },
    quantity: { type: Number, required: true, min: 0.0001 },
    fromLocationId: { type: Schema.Types.ObjectId, ref: 'WarehouseLocation' },
    toLocationId: { type: Schema.Types.ObjectId, ref: 'WarehouseLocation' },
  },
  { timestamps: true, versionKey: false }
);

stockTransferItemSchema.index({ transferId: 1, productId: 1, batchId: 1 });

export const StockTransfer = mongoose.model<IStockTransferDoc, IStockTransferModel>('StockTransfer', stockTransferSchema);
export const StockTransferItem = mongoose.model<IStockTransferItemDoc, IStockTransferItemModel>(
  'StockTransferItem',
  stockTransferItemSchema
);

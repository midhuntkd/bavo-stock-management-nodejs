import mongoose, { Schema } from 'mongoose';
import { IStockMovementDoc, IStockMovementModel } from './stock-movement.interface';

const stockMovementSchema = new Schema<IStockMovementDoc, IStockMovementModel>(
  {
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVE', 'RELEASE'],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    referenceType: { type: String },
    referenceId: { type: String },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

stockMovementSchema.index({ warehouseId: 1, stockId: 1, type: 1, createdAt: -1 });

const StockMovement = mongoose.model<IStockMovementDoc, IStockMovementModel>('StockMovement', stockMovementSchema);

export default StockMovement;

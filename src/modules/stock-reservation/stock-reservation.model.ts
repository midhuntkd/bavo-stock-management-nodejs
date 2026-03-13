import mongoose, { Schema } from 'mongoose';
import { IStockReservationDoc, IStockReservationModel } from './stock-reservation.interface';

const stockReservationSchema = new Schema<IStockReservationDoc, IStockReservationModel>(
  {
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'StockBatch', index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    orderId: { type: String, required: true, trim: true, index: true },
    quantity: { type: Number, required: true, min: 0.0001 },
    status: { type: String, enum: ['reserved', 'released', 'consumed', 'expired'], default: 'reserved', index: true },
    expiresAt: { type: Date, index: true },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

stockReservationSchema.index({ orderId: 1 });
stockReservationSchema.index({ expiresAt: 1 });

const StockReservation = mongoose.model<IStockReservationDoc, IStockReservationModel>('StockReservation', stockReservationSchema);

export default StockReservation;

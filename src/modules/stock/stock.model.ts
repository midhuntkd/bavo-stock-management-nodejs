import mongoose, { Schema } from 'mongoose';
import { IStockDoc, IStockModel } from './stock.interface';

const stockSchema = new Schema<IStockDoc, IStockModel>(
  {
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    reservedQuantity: { type: Number, required: true, min: 0, default: 0 },
    availableQuantity: { type: Number, required: true, min: 0, default: 0 },
    minimumStockLevel: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

stockSchema.index({ warehouseId: 1, sku: 1 }, { unique: true });
stockSchema.index({ status: 1, minimumStockLevel: 1, availableQuantity: 1 });

const Stock = mongoose.model<IStockDoc, IStockModel>('Stock', stockSchema);

export default Stock;

import mongoose, { Schema } from 'mongoose';
import { IStockDoc, IStockModel } from './stock.interface';

const stockSchema = new Schema<IStockDoc, IStockModel>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'WarehouseLocation', default: null, index: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reservedQuantity: { type: Number, required: true, default: 0, min: 0 },
    damagedQuantity: { type: Number, required: true, default: 0, min: 0 },
    availableQuantity: { type: Number, required: true, default: 0, min: 0 },
    minStockLevel: { type: Number, required: true, default: 0, min: 0 },
    reorderLevel: { type: Number, required: true, default: 0, min: 0 },
    maxStockLevel: { type: Number, required: true, default: 0, min: 0 },
    lastPurchasePrice: { type: Number, required: true, default: 0, min: 0 },
    weightedAverageCost: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ['inStock', 'lowStock', 'outOfStock', 'inactive'], default: 'outOfStock', index: true },
  },
  { timestamps: true, versionKey: false }
);

stockSchema.index({ warehouseId: 1, productId: 1, locationId: 1 }, { unique: true });
stockSchema.index({ warehouseId: 1, status: 1 });
stockSchema.index({ productId: 1, availableQuantity: 1 });

const Stock = mongoose.model<IStockDoc, IStockModel>('Stock', stockSchema);

export default Stock;

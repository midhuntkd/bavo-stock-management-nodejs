import mongoose, { Schema } from 'mongoose';
import { IStockBatchDoc, IStockBatchModel } from './stock-batch.interface';

const stockBatchSchema = new Schema<IStockBatchDoc, IStockBatchModel>(
  {
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'WarehouseLocation', index: true },
    batchNo: { type: String, required: true, trim: true, index: true },
    lotNo: { type: String, trim: true },
    mfgDate: { type: Date },
    expiryDate: { type: Date, index: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reservedQuantity: { type: Number, required: true, default: 0, min: 0 },
    availableQuantity: { type: Number, required: true, default: 0, min: 0 },
    purchasePrice: { type: Number, required: true, default: 0, min: 0 },
    salePrice: { type: Number, required: true, default: 0, min: 0 },
    mrp: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'expired', 'damaged', 'blocked'], default: 'active', index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    grnId: { type: Schema.Types.ObjectId, ref: 'GoodsReceiptNote' },
    // Expiry markdown tracking
    originalSalePrice: { type: Number, min: 0 },
    markdownPercent: { type: Number, min: 0, max: 100, default: 0 },
    markdownApplied: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

stockBatchSchema.index({ warehouseId: 1, productId: 1, expiryDate: 1 });
stockBatchSchema.index({ batchNo: 1 });
stockBatchSchema.index({ stockId: 1, batchNo: 1 }, { unique: true });

const StockBatch = mongoose.model<IStockBatchDoc, IStockBatchModel>('StockBatch', stockBatchSchema);

export default StockBatch;

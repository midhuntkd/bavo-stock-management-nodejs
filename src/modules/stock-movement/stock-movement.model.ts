import mongoose, { Schema } from 'mongoose';
import { IStockMovementDoc, IStockMovementModel } from './stock-movement.interface';

const stockMovementSchema = new Schema<IStockMovementDoc, IStockMovementModel>(
  {
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'StockBatch', index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'WarehouseLocation', index: true },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVE', 'RELEASE', 'RETURN_IN', 'RETURN_OUT'],
      required: true,
      index: true,
    },
    movementType: {
      type: String,
      enum: ['purchase', 'sale', 'inHouseSale', 'warehouseTransfer', 'damage', 'replace', 'expiry', 'return', 'manualAdjustment'],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, min: 0 },
    unitPrice: { type: Number, min: 0 },
    amount: { type: Number },
    gstAmount: { type: Number },
    referenceType: { type: String, index: true },
    referenceId: { type: String, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'SaleInvoice' },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    grnId: { type: Schema.Types.ObjectId, ref: 'GoodsReceiptNote' },
    inHouseUser: { type: String, enum: ['midhun', 'shamshad', 'faseeh', 'staff'] },
    staffId: { type: String },
    priceType: { type: String, enum: ['costPrice', 'salePrice', 'mrp', 'actual'] },
    note: { type: String },
    balanceAfterMovement: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

stockMovementSchema.index({ warehouseId: 1, createdAt: -1 });
stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });

const StockMovement = mongoose.model<IStockMovementDoc, IStockMovementModel>('StockMovement', stockMovementSchema);

export default StockMovement;

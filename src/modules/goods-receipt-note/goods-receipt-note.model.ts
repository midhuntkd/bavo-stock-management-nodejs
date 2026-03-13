import mongoose, { Schema } from 'mongoose';
import {
  IGoodsReceiptNoteDoc,
  IGoodsReceiptNoteItemDoc,
  IGoodsReceiptNoteItemModel,
  IGoodsReceiptNoteModel,
} from './goods-receipt-note.interface';

const grnSchema = new Schema<IGoodsReceiptNoteDoc, IGoodsReceiptNoteModel>(
  {
    grnNumber: { type: String, required: true, unique: true, index: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    invoiceNo: { type: String },
    invoiceDate: { type: Date },
    status: { type: String, enum: ['draft', 'received', 'cancelled'], default: 'draft', index: true },
    note: { type: String },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

const grnItemSchema = new Schema<IGoodsReceiptNoteItemDoc, IGoodsReceiptNoteItemModel>(
  {
    grnId: { type: Schema.Types.ObjectId, ref: 'GoodsReceiptNote', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    batchNo: { type: String },
    expiryDate: { type: Date },
    receivedQty: { type: Number, required: true, min: 0 },
    freeQty: { type: Number, required: true, default: 0, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    locationId: { type: Schema.Types.ObjectId, ref: 'WarehouseLocation' },
  },
  { timestamps: true, versionKey: false }
);

grnItemSchema.index({ grnId: 1, productId: 1 });

export const GoodsReceiptNote = mongoose.model<IGoodsReceiptNoteDoc, IGoodsReceiptNoteModel>('GoodsReceiptNote', grnSchema);
export const GoodsReceiptNoteItem = mongoose.model<IGoodsReceiptNoteItemDoc, IGoodsReceiptNoteItemModel>(
  'GoodsReceiptNoteItem',
  grnItemSchema
);

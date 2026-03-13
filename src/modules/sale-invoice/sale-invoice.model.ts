import mongoose, { Schema } from 'mongoose';
import { ISaleInvoiceDoc, ISaleInvoiceItemDoc, ISaleInvoiceItemModel, ISaleInvoiceModel } from './sale-invoice.interface';

const saleInvoiceSchema = new Schema<ISaleInvoiceDoc, ISaleInvoiceModel>(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    invoiceType: { type: String, enum: ['customerSale', 'inHouseSale'], required: true, index: true },
    customerName: { type: String },
    customerPhone: { type: String },
    inHouseUser: { type: String, enum: ['midhun', 'shamshad', 'faseeh', 'staff'] },
    staffId: { type: String },
    subtotal: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, enum: ['cash', 'upi', 'card', 'wallet', 'credit'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'partial', 'cancelled'], default: 'pending', index: true },
    status: { type: String, enum: ['draft', 'confirmed', 'cancelled'], default: 'draft', index: true },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

saleInvoiceSchema.index({ warehouseId: 1, createdAt: -1 });
saleInvoiceSchema.index({ invoiceType: 1, paymentStatus: 1 });

const saleInvoiceItemSchema = new Schema<ISaleInvoiceItemDoc, ISaleInvoiceItemModel>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'SaleInvoice', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock' },
    batchId: { type: Schema.Types.ObjectId, ref: 'StockBatch' },
    productName: { type: String, required: true },
    sku: { type: String },
    unit: { type: String },
    quantity: { type: Number, required: true, min: 0.0001 },
    unitPrice: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

saleInvoiceItemSchema.index({ invoiceId: 1, productId: 1 });

export const SaleInvoice = mongoose.model<ISaleInvoiceDoc, ISaleInvoiceModel>('SaleInvoice', saleInvoiceSchema);
export const SaleInvoiceItem = mongoose.model<ISaleInvoiceItemDoc, ISaleInvoiceItemModel>('SaleInvoiceItem', saleInvoiceItemSchema);

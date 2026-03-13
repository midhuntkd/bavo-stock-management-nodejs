import mongoose, { Schema } from 'mongoose';
import {
  IPurchaseOrderDoc,
  IPurchaseOrderItemDoc,
  IPurchaseOrderItemModel,
  IPurchaseOrderModel,
} from './purchase-order.interface';

const purchaseOrderSchema = new Schema<IPurchaseOrderDoc, IPurchaseOrderModel>(
  {
    poNumber: { type: String, required: true, unique: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'approved', 'partiallyReceived', 'received', 'cancelled'],
      default: 'draft',
      index: true,
    },
    orderDate: { type: Date, required: true },
    expectedDate: { type: Date },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0, default: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

const purchaseOrderItemSchema = new Schema<IPurchaseOrderItemDoc, IPurchaseOrderItemModel>(
  {
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    orderedQty: { type: Number, required: true, min: 0.0001 },
    receivedQty: { type: Number, required: true, default: 0, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, default: 0, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

purchaseOrderItemSchema.index({ purchaseOrderId: 1, productId: 1 }, { unique: true });

export const PurchaseOrder = mongoose.model<IPurchaseOrderDoc, IPurchaseOrderModel>('PurchaseOrder', purchaseOrderSchema);
export const PurchaseOrderItem = mongoose.model<IPurchaseOrderItemDoc, IPurchaseOrderItemModel>(
  'PurchaseOrderItem',
  purchaseOrderItemSchema
);

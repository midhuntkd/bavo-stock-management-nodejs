import { Document, Model, Types } from 'mongoose';

export type PurchaseOrderStatus = 'draft' | 'approved' | 'partiallyReceived' | 'received' | 'cancelled';

export interface IPurchaseOrder {
  poNumber: string;
  warehouseId: Types.ObjectId;
  supplierId: Types.ObjectId;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDate?: Date;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  note?: string;
  createdBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseOrderItem {
  purchaseOrderId: Types.ObjectId;
  productId: Types.ObjectId;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  gstRate: number;
  discountAmount: number;
  lineTotal: number;
}

export interface IPurchaseOrderDoc extends IPurchaseOrder, Document {}
export interface IPurchaseOrderModel extends Model<IPurchaseOrderDoc> {}

export interface IPurchaseOrderItemDoc extends IPurchaseOrderItem, Document {}
export interface IPurchaseOrderItemModel extends Model<IPurchaseOrderItemDoc> {}

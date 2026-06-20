import { Document, Model, Types } from 'mongoose';

export type GRNStatus = 'draft' | 'received' | 'cancelled';

export interface IGoodsReceiptNote {
  grnNumber: string;
  purchaseOrderId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  supplierId: Types.ObjectId;
  invoiceNo?: string;
  invoiceDate?: Date;
  status: GRNStatus;
  note?: string;
  receivedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoodsReceiptNoteItem {
  grnId: Types.ObjectId;
  productId: Types.ObjectId;
  batchNo?: string;
  expiryDate?: Date;
  receivedQty: number;
  freeQty: number;
  // Weight-based product support
  grossWeight?: number;
  tareWeightDeducted?: number;
  netWeight?: number;
  unitCost: number;
  gstRate: number;
  mrp: number;
  salePrice: number;
  lineTotal: number;
  locationId?: Types.ObjectId;
}

export interface IGoodsReceiptNoteDoc extends IGoodsReceiptNote, Document {}
export interface IGoodsReceiptNoteModel extends Model<IGoodsReceiptNoteDoc> {}

export interface IGoodsReceiptNoteItemDoc extends IGoodsReceiptNoteItem, Document {}
export interface IGoodsReceiptNoteItemModel extends Model<IGoodsReceiptNoteItemDoc> {}

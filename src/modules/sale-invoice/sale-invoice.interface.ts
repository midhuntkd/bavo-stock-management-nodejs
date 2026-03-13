import { Document, Model, Types } from 'mongoose';

export interface ISaleInvoice {
  invoiceNo: string;
  warehouseId: Types.ObjectId;
  invoiceType: 'customerSale' | 'inHouseSale';
  customerName?: string;
  customerPhone?: string;
  inHouseUser?: 'midhun' | 'shamshad' | 'faseeh' | 'staff';
  staffId?: string;
  subtotal: number;
  gstAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMode: 'cash' | 'upi' | 'card' | 'wallet' | 'credit';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'cancelled';
  status: 'draft' | 'confirmed' | 'cancelled';
  note?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISaleInvoiceItem {
  invoiceId: Types.ObjectId;
  productId: Types.ObjectId;
  stockId?: Types.ObjectId;
  batchId?: Types.ObjectId;
  productName: string;
  sku?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  mrp: number;
  discountAmount: number;
  lineTotal: number;
}

export interface ISaleInvoiceDoc extends ISaleInvoice, Document {}
export interface ISaleInvoiceModel extends Model<ISaleInvoiceDoc> {}

export interface ISaleInvoiceItemDoc extends ISaleInvoiceItem, Document {}
export interface ISaleInvoiceItemModel extends Model<ISaleInvoiceItemDoc> {}

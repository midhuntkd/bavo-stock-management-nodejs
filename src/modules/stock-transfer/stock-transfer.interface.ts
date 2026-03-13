import { Document, Model, Types } from 'mongoose';

export type StockTransferStatus = 'draft' | 'inTransit' | 'received' | 'cancelled';

export interface IStockTransfer {
  transferNumber: string;
  fromWarehouseId: Types.ObjectId;
  toWarehouseId: Types.ObjectId;
  status: StockTransferStatus;
  transferDate: Date;
  note?: string;
  createdBy?: Types.ObjectId;
  receivedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockTransferItem {
  transferId: Types.ObjectId;
  productId: Types.ObjectId;
  batchId?: Types.ObjectId;
  quantity: number;
  fromLocationId?: Types.ObjectId;
  toLocationId?: Types.ObjectId;
}

export interface IStockTransferDoc extends IStockTransfer, Document {}
export interface IStockTransferModel extends Model<IStockTransferDoc> {}

export interface IStockTransferItemDoc extends IStockTransferItem, Document {}
export interface IStockTransferItemModel extends Model<IStockTransferItemDoc> {}

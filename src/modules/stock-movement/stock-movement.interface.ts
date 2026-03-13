import { Document, Model, Types } from 'mongoose';

export type MovementType =
  | 'IN'
  | 'OUT'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RESERVE'
  | 'RELEASE'
  | 'RETURN_IN'
  | 'RETURN_OUT';

export type BusinessMovementType =
  | 'purchase'
  | 'sale'
  | 'inHouseSale'
  | 'warehouseTransfer'
  | 'damage'
  | 'replace'
  | 'expiry'
  | 'return'
  | 'manualAdjustment';

export interface IStockMovement {
  stockId: Types.ObjectId;
  batchId?: Types.ObjectId;
  productId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  locationId?: Types.ObjectId;
  type: MovementType;
  movementType: BusinessMovementType;
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
  amount?: number;
  gstAmount?: number;
  referenceType?: string;
  referenceId?: string;
  invoiceId?: Types.ObjectId;
  purchaseOrderId?: Types.ObjectId;
  grnId?: Types.ObjectId;
  inHouseUser?: 'midhun' | 'shamshad' | 'faseeh' | 'staff';
  staffId?: string;
  priceType?: 'costPrice' | 'salePrice' | 'mrp' | 'actual';
  note?: string;
  balanceAfterMovement: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockMovementDoc extends IStockMovement, Document {}
export interface IStockMovementModel extends Model<IStockMovementDoc> {}

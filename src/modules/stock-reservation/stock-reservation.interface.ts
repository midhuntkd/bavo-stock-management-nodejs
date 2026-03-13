import { Document, Model, Types } from 'mongoose';

export type ReservationStatus = 'reserved' | 'released' | 'consumed' | 'expired';

export interface IStockReservation {
  warehouseId: Types.ObjectId;
  stockId: Types.ObjectId;
  batchId?: Types.ObjectId;
  productId: Types.ObjectId;
  orderId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt?: Date;
  note?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockReservationDoc extends IStockReservation, Document {}
export interface IStockReservationModel extends Model<IStockReservationDoc> {}

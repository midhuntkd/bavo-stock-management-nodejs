import { Document, Model, Types } from 'mongoose';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RESERVE' | 'RELEASE';

export interface IStockMovement {
  stockId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  type: MovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockMovementDoc extends IStockMovement, Document {}

export interface IStockMovementModel extends Model<IStockMovementDoc> {}

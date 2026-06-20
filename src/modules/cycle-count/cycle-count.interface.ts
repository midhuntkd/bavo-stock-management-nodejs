import { Document, Model, Types } from 'mongoose';

export type CycleCountStatus = 'draft' | 'inProgress' | 'submitted' | 'reconciled';

export interface ICycleCount {
  countNo: string;
  warehouseId: Types.ObjectId;
  locationId?: Types.ObjectId;
  categoryId?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  status: CycleCountStatus;
  blindAudit: boolean;         // When true, systemQty is hidden from counter until submission
  note?: string;
  scheduledDate?: Date;
  startedAt?: Date;
  submittedAt?: Date;
  reconciledAt?: Date;
  adjustmentId?: Types.ObjectId; // Auto-created StockAdjustment after submission
  createdBy?: Types.ObjectId;
  reconciledBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICycleCountItem {
  cycleCountId: Types.ObjectId;
  stockId: Types.ObjectId;
  batchId?: Types.ObjectId;
  productId: Types.ObjectId;
  systemQty: number;       // Current availableQuantity at count creation — hidden in blind mode
  countedQty?: number;     // Entered by staff
  variance?: number;       // countedQty - systemQty; computed on submit
  note?: string;
}

export interface ICycleCountDoc extends ICycleCount, Document {}
export interface ICycleCountModel extends Model<ICycleCountDoc> {}

export interface ICycleCountItemDoc extends ICycleCountItem, Document {}
export interface ICycleCountItemModel extends Model<ICycleCountItemDoc> {}

import { Document, Model, Types } from 'mongoose';

export type StockStatus = 'inStock' | 'lowStock' | 'outOfStock' | 'inactive';

export interface IStock {
  productId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  locationId?: Types.ObjectId;
  quantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  availableQuantity: number;
  minStockLevel: number;
  reorderLevel: number;
  maxStockLevel: number;
  lastPurchasePrice: number;
  weightedAverageCost: number;
  status: StockStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockDoc extends IStock, Document {}
export interface IStockModel extends Model<IStockDoc> {}

import { Document, Model, Types } from 'mongoose';

export type ProductUnit = 'g' | 'kg' | 'ml' | 'l' | 'pc' | 'pack' | 'box';

export interface IProduct {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  category?: string;
  manufacturer?: string;
  brandId?: Types.ObjectId;
  unit: ProductUnit;
  unitMeasurement?: string;
  unitValue?: number;
  availableQuantity?: number;
  packSize?: string;
  hsnCode?: string;
  gstRate: number;
  mrp: number;
  salePrice: number;
  costPrice: number;
  trackInventory: boolean;
  batchEnabled: boolean;
  expiryEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDoc extends IProduct, Document {}
export interface IProductModel extends Model<IProductDoc> {}

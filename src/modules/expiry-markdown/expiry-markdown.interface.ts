import { Document, Model, Types } from 'mongoose';

export interface IMarkdownTier {
  daysBeforeExpiry: number; // e.g. 7 means "within 7 days of expiry"
  discountPercent: number;  // e.g. 20 = 20% off
}

export interface IExpiryMarkdownRule {
  name: string;
  warehouseId?: Types.ObjectId; // null = global rule
  categoryId?: Types.ObjectId;  // null = all categories
  tiers: IMarkdownTier[];       // sorted descending by daysBeforeExpiry
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpiryMarkdownRuleDoc extends IExpiryMarkdownRule, Document {}
export interface IExpiryMarkdownRuleModel extends Model<IExpiryMarkdownRuleDoc> {}

export interface IMarkdownLog {
  ruleId: Types.ObjectId;
  batchId: Types.ObjectId;
  productId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  daysToExpiry: number;
  previousSalePrice: number;
  newSalePrice: number;
  discountPercent: number;
  appliedAt: Date;
}

export interface IMarkdownLogDoc extends IMarkdownLog, Document {}
export interface IMarkdownLogModel extends Model<IMarkdownLogDoc> {}

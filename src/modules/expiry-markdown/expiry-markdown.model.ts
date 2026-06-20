import mongoose, { Schema } from 'mongoose';
import {
  IExpiryMarkdownRuleDoc,
  IExpiryMarkdownRuleModel,
  IMarkdownLogDoc,
  IMarkdownLogModel,
} from './expiry-markdown.interface';

const markdownTierSchema = new Schema(
  {
    daysBeforeExpiry: { type: Number, required: true, min: 1 },
    discountPercent: { type: Number, required: true, min: 0.01, max: 100 },
  },
  { _id: false }
);

const expiryMarkdownRuleSchema = new Schema<IExpiryMarkdownRuleDoc, IExpiryMarkdownRuleModel>(
  {
    name: { type: String, required: true, trim: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', default: null, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    tiers: { type: [markdownTierSchema], required: true, validate: [(v: any[]) => v.length > 0, 'At least one tier required'] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

const markdownLogSchema = new Schema<IMarkdownLogDoc, IMarkdownLogModel>(
  {
    ruleId: { type: Schema.Types.ObjectId, ref: 'ExpiryMarkdownRule', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'StockBatch', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    daysToExpiry: { type: Number, required: true },
    previousSalePrice: { type: Number, required: true },
    newSalePrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    appliedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

markdownLogSchema.index({ batchId: 1, appliedAt: -1 });

export const ExpiryMarkdownRule = mongoose.model<IExpiryMarkdownRuleDoc, IExpiryMarkdownRuleModel>(
  'ExpiryMarkdownRule',
  expiryMarkdownRuleSchema
);

export const MarkdownLog = mongoose.model<IMarkdownLogDoc, IMarkdownLogModel>(
  'MarkdownLog',
  markdownLogSchema
);

import mongoose, { Schema } from 'mongoose';
import { IInHandAmountDoc, IInHandAmountModel, IN_HAND_AMOUNT_COLLECT_TYPES } from './in-hand-amount.interface';

const inHandAmountSchema = new Schema<IInHandAmountDoc, IInHandAmountModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collectDate: { type: Date, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    orderID: { type: String, trim: true },
    collectType: { type: String, enum: IN_HAND_AMOUNT_COLLECT_TYPES, required: true, index: true },
    description: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

inHandAmountSchema.index({ userId: 1, collectDate: -1, isActive: 1 });
inHandAmountSchema.index({ collectType: 1, collectDate: -1, isActive: 1 });

const InHandAmount = mongoose.model<IInHandAmountDoc, IInHandAmountModel>('InHandAmount', inHandAmountSchema);

export default InHandAmount;

import mongoose, { Schema } from 'mongoose';
import { IPersonalSpendDoc, IPersonalSpendModel } from './personal-spend.interface';

const personalSpendSchema = new Schema<IPersonalSpendDoc, IPersonalSpendModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    spendDate: { type: Date, required: true, index: true },
    spendType: {
      type: String,
      enum: ['fuel', 'travel', 'food', 'courier', 'officeExpense', 'billPayment', 'materialPurchase', 'maintenance', 'other'],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, enum: ['cash', 'bank', 'upi', 'card', 'other'], required: true },
    description: { type: String, required: true, trim: true },
    vendorName: { type: String, trim: true },
    billNo: { type: String, trim: true },
    proof: { type: String, trim: true },
    note: { type: String, trim: true },
    clearanceStatus: {
      type: String,
      enum: ['pending', 'partiallyCleared', 'cleared', 'carriedForward'],
      default: 'pending',
      index: true,
    },
    clearedAmount: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },
    companyAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    clearedAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

personalSpendSchema.index({ userId: 1, spendDate: -1, isActive: 1 });

const PersonalSpend = mongoose.model<IPersonalSpendDoc, IPersonalSpendModel>('PersonalSpend', personalSpendSchema);

export default PersonalSpend;
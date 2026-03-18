import mongoose, { Schema } from 'mongoose';
import { IInvestmentDoc, IInvestmentModel } from './investment.interface';

const investmentSchema = new Schema<IInvestmentDoc, IInvestmentModel>(
  {
    investmentNo: { type: String, required: true, unique: true, index: true },
    investorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roleSnapshot: { type: String, trim: true },
    investmentDate: { type: Date, required: true, index: true },
    investmentType: {
      type: String,
      enum: ['cashDeposit', 'bankDeposit', 'billPayment', 'materialPurchase', 'expensePaid', 'assetPurchase', 'other'],
      required: true,
    },
    paymentMode: { type: String, enum: ['cash', 'bank', 'upi', 'card', 'cheque', 'other'], required: true },
    amount: { type: Number, required: true, min: 0 },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', index: true },
    affectsCompanyAccount: { type: Boolean, default: false, index: true },
    category: { type: String, trim: true },
    vendorName: { type: String, trim: true },
    billNo: { type: String, trim: true },
    description: { type: String, trim: true },
    note: { type: String, trim: true },
    proof: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'confirmed', 'cancelled'], default: 'draft', index: true },
    accountTransactionId: { type: Schema.Types.ObjectId, ref: 'AccountTransaction' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

investmentSchema.index({ investorUserId: 1, investmentDate: -1 });

const Investment = mongoose.model<IInvestmentDoc, IInvestmentModel>('Investment', investmentSchema);

export default Investment;
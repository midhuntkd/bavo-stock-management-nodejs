import mongoose, { Schema } from 'mongoose';
import { IReimbursementDoc, IReimbursementModel } from './reimbursement.interface';

const reimbursementSchema = new Schema<IReimbursementDoc, IReimbursementModel>(
  {
    reimbursementNo: { type: String, required: true, unique: true, index: true },
    personalSpendId: { type: Schema.Types.ObjectId, ref: 'PersonalSpend', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', index: true },
    clearanceDate: { type: Date, required: true, index: true },
    clearedAmount: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    actionType: { type: String, enum: ['partialClear', 'fullClear', 'extend', 'carryForward'], required: true },
    paymentMethod: { type: String, enum: ['cash', 'bank', 'upi', 'card', 'other'] },
    note: { type: String, trim: true },
    proof: { type: String, trim: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },
    accountTransactionId: { type: Schema.Types.ObjectId, ref: 'AccountTransaction' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

reimbursementSchema.index({ userId: 1, clearanceDate: -1, status: 1 });

const Reimbursement = mongoose.model<IReimbursementDoc, IReimbursementModel>('Reimbursement', reimbursementSchema);

export default Reimbursement;
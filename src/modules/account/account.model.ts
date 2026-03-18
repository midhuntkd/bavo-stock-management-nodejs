import mongoose, { Schema } from 'mongoose';
import { IAccountDoc, IAccountModel } from './account.interface';

const accountSchema = new Schema<IAccountDoc, IAccountModel>(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, trim: true, uppercase: true, unique: true, sparse: true, index: true },
    type: { type: String, enum: ['cash', 'bank', 'wallet', 'upi', 'other'], required: true, index: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifsc: { type: String, trim: true },
    branch: { type: String, trim: true },
    openingBalance: { type: Number, required: true, default: 0, min: 0 },
    currentBalance: { type: Number, required: true, default: 0 },
    currency: { type: String, trim: true, uppercase: true, default: 'INR' },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

accountSchema.index({ name: 1, type: 1 }, { unique: true });

const Account = mongoose.model<IAccountDoc, IAccountModel>('Account', accountSchema);

export default Account;
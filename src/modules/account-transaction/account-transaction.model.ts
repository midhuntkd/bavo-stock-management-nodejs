import mongoose, { Schema } from 'mongoose';
import { IAccountTransactionDoc, IAccountTransactionModel } from './account-transaction.interface';

const accountTransactionSchema = new Schema<IAccountTransactionDoc, IAccountTransactionModel>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    transactionDate: { type: Date, required: true, index: true },
    type: { type: String, enum: ['credit', 'debit', 'transfer_in', 'transfer_out', 'opening'], required: true, index: true },
    sourceType: {
      type: String,
      enum: ['investment', 'expense', 'sale', 'purchase', 'salary', 'bill', 'bankDeposit', 'bankWithdrawal', 'reimbursementClearance', 'manual', 'transfer'],
      required: true,
      index: true,
    },
    referenceType: { type: String, trim: true },
    referenceId: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'bank', 'upi', 'card', 'cheque', 'other'], required: true },
    description: { type: String, trim: true },
    note: { type: String, trim: true },
    proof: { type: String, trim: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    reversalOf: { type: Schema.Types.ObjectId, ref: 'AccountTransaction', index: true },
  },
  { timestamps: true, versionKey: false }
);

accountTransactionSchema.index({ accountId: 1, transactionDate: -1, status: 1 });

const AccountTransaction = mongoose.model<IAccountTransactionDoc, IAccountTransactionModel>(
  'AccountTransaction',
  accountTransactionSchema
);

export default AccountTransaction;
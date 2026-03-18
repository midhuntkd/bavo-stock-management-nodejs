import mongoose, { Schema } from 'mongoose';
import {
  COMPANY_EXPENSE_PAYMENT_METHODS,
  COMPANY_EXPENSE_STATUSES,
  COMPANY_EXPENSE_TYPES,
  ICompanyExpenseDoc,
  ICompanyExpenseModel,
} from './company-expense.interface';

const companyExpenseSchema = new Schema<ICompanyExpenseDoc, ICompanyExpenseModel>(
  {
    expenseDate: { type: Date, required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    expenseType: { type: String, enum: COMPANY_EXPENSE_TYPES, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: COMPANY_EXPENSE_PAYMENT_METHODS, required: true },
    vendorName: { type: String, trim: true },
    billNo: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    proof: { type: String, trim: true },
    transferredByUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: COMPANY_EXPENSE_STATUSES, default: 'draft', index: true },
    affectsAccount: { type: Boolean, default: true, index: true },
    referenceType: { type: String, trim: true },
    referenceId: { type: String, trim: true },
    accountTransactionId: { type: Schema.Types.ObjectId, ref: 'AccountTransaction', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

companyExpenseSchema.index({ accountId: 1, expenseDate: -1, status: 1 });
companyExpenseSchema.index({ expenseType: 1, expenseDate: -1 });

const CompanyExpense = mongoose.model<ICompanyExpenseDoc, ICompanyExpenseModel>('CompanyExpense', companyExpenseSchema);

export default CompanyExpense;
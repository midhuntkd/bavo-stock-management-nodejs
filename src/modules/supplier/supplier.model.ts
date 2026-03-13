import mongoose, { Schema } from 'mongoose';
import { ISupplierDoc, ISupplierModel } from './supplier.interface';

const supplierSchema = new Schema<ISupplierDoc, ISupplierModel>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    gstNo: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

supplierSchema.index({ code: 1 }, { unique: true });
supplierSchema.index({ isActive: 1, name: 1 });

const Supplier = mongoose.model<ISupplierDoc, ISupplierModel>('Supplier', supplierSchema);
export default Supplier;

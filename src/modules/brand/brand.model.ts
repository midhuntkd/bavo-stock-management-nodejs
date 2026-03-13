import mongoose, { Schema } from 'mongoose';
import { IBrandDoc, IBrandModel } from './brand.interface';

const brandSchema = new Schema<IBrandDoc, IBrandModel>(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, trim: true, uppercase: true },
    slug: { type: String, trim: true, lowercase: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    manufacturer: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

brandSchema.index({ supplierId: 1, name: 1 }, { unique: true });
brandSchema.index({ supplierId: 1, isActive: 1 });

const Brand = mongoose.model<IBrandDoc, IBrandModel>('Brand', brandSchema);

export default Brand;

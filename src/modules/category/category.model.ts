import mongoose, { Schema } from 'mongoose';
import { ICategoryDoc, ICategoryModel } from './category.interface';

const categorySchema = new Schema<ICategoryDoc, ICategoryModel>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    pageKey: { type: String, trim: true },
    slug: { type: String, trim: true, lowercase: true, index: true, unique: true, sparse: true },
    sortOrder: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Delete'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

categorySchema.index({ status: 1, sortOrder: 1, name: 1 });

const Category = mongoose.model<ICategoryDoc, ICategoryModel>('Category', categorySchema);

export default Category;

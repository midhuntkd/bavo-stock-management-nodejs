import mongoose, { Schema } from 'mongoose';
import { IProductDoc, IProductModel } from './product.interface';

const productSchema = new Schema<IProductDoc, IProductModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    sku: { type: String, required: true, trim: true, uppercase: true, unique: true },
    barcode: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    manufacturer: { type: String, trim: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', index: true },
    unit: { type: String, enum: ['g', 'kg', 'ml', 'l', 'pc', 'pack', 'box'], required: true },
    unitMeasurement: { type: String, trim: true },
    unitValue: { type: Number, min: 0 },
    availableQuantity: { type: Number, min: 0 },
    packSize: { type: String, trim: true },
    hsnCode: { type: String, trim: true },
    gstRate: { type: Number, min: 0, required: true },
    mrp: { type: Number, min: 0, required: true },
    salePrice: { type: Number, min: 0, required: true },
    costPrice: { type: Number, min: 0, required: true },
    trackInventory: { type: Boolean, default: true },
    batchEnabled: { type: Boolean, default: false },
    expiryEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ isActive: 1, name: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ categoryId: 1 });

const Product = mongoose.model<IProductDoc, IProductModel>('Product', productSchema);
export default Product;

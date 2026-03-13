import mongoose, { Schema } from 'mongoose';
import { IWarehouseDoc, IWarehouseModel } from './warehouse.interface';

const warehouseSchema = new Schema<IWarehouseDoc, IWarehouseModel>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true, uppercase: true },
    type: { type: String, enum: ['darkStore', 'mainWarehouse', 'miniWarehouse', 'store'], required: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    serviceArea: {
      type: {
        type: String,
        enum: ['Polygon'],
      },
      coordinates: {
        type: [[[Number]]],
      },
    },
    openingTime: { type: String, trim: true },
    closingTime: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

warehouseSchema.index({ code: 1 }, { unique: true });
warehouseSchema.index({ isActive: 1, type: 1 });
warehouseSchema.index({ serviceArea: '2dsphere' });

const Warehouse = mongoose.model<IWarehouseDoc, IWarehouseModel>('Warehouse', warehouseSchema);

export default Warehouse;

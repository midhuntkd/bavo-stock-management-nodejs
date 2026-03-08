import mongoose, { Schema } from 'mongoose';
import { IWarehouseDoc, IWarehouseModel } from './warehouse.interface';

const warehouseSchema = new Schema<IWarehouseDoc, IWarehouseModel>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true, uppercase: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

warehouseSchema.index({ code: 1 }, { unique: true });
warehouseSchema.index({ status: 1, isDeleted: 1 });

const Warehouse = mongoose.model<IWarehouseDoc, IWarehouseModel>('Warehouse', warehouseSchema);

export default Warehouse;

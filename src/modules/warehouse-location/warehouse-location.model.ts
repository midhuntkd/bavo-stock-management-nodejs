import mongoose, { Schema } from 'mongoose';
import { IWarehouseLocationDoc, IWarehouseLocationModel } from './warehouse-location.interface';

const warehouseLocationSchema = new Schema<IWarehouseLocationDoc, IWarehouseLocationModel>(
  {
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    zone: { type: String, required: true, trim: true },
    rack: { type: String, required: true, trim: true },
    shelf: { type: String, required: true, trim: true },
    bin: { type: String, required: true, trim: true },
    locationCode: { type: String, required: true, trim: true, uppercase: true },
    isPickable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

warehouseLocationSchema.index({ warehouseId: 1, locationCode: 1 }, { unique: true });
warehouseLocationSchema.index({ warehouseId: 1, isActive: 1, priority: -1 });

const WarehouseLocation = mongoose.model<IWarehouseLocationDoc, IWarehouseLocationModel>(
  'WarehouseLocation',
  warehouseLocationSchema
);

export default WarehouseLocation;

import mongoose, { Schema } from 'mongoose';
import { IPermissionDoc, IPermissionModel } from './permission.interface';

const permissionSchema = new Schema<IPermissionDoc, IPermissionModel>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    group: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

const Permission = mongoose.model<IPermissionDoc, IPermissionModel>('Permission', permissionSchema);

export default Permission;

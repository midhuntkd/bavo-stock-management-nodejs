import mongoose, { Schema } from 'mongoose';
import { IPermissionDoc, IPermissionModel } from './permission.interface';

const permissionSchema = new Schema<IPermissionDoc, IPermissionModel>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true, lowercase: true },
    module: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

permissionSchema.index({ module: 1, code: 1 }, { unique: true });

permissionSchema.statics.isCodeTaken = async function isCodeTaken(code: string, excludeId?: string) {
  const doc = await this.findOne({ code, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  return !!doc;
};

const Permission = mongoose.model<IPermissionDoc, IPermissionModel>('Permission', permissionSchema);

export default Permission;

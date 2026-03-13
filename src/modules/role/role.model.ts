import mongoose, { Schema } from 'mongoose';
import { IRoleDoc, IRoleModel } from './role.interface';

const roleSchema = new Schema<IRoleDoc, IRoleModel>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

roleSchema.index({ code: 1 }, { unique: true });

roleSchema.statics.isCodeTaken = async function isCodeTaken(code: string, excludeId?: string) {
  const doc = await this.findOne({ code, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  return !!doc;
};

const Role = mongoose.model<IRoleDoc, IRoleModel>('Role', roleSchema);

export default Role;

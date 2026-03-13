import mongoose, { Schema } from 'mongoose';
import { IRolePermissionDoc, IRolePermissionModel } from './role-permission.interface';

const rolePermissionSchema = new Schema<IRolePermissionDoc, IRolePermissionModel>(
  {
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    permissionId: { type: Schema.Types.ObjectId, ref: 'Permission', required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

const RolePermission = mongoose.model<IRolePermissionDoc, IRolePermissionModel>('RolePermission', rolePermissionSchema);

export default RolePermission;

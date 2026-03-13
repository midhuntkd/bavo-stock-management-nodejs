import { Document, Model, Types } from 'mongoose';

export interface IRolePermission {
  roleId: Types.ObjectId;
  permissionId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRolePermissionDoc extends IRolePermission, Document {}
export interface IRolePermissionModel extends Model<IRolePermissionDoc> {}

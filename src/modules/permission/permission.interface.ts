import { Document, Model, Types } from 'mongoose';

export interface IPermission {
  name: string;
  code: string;
  module: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPermissionDoc extends IPermission, Document {}

export interface IPermissionModel extends Model<IPermissionDoc> {
  isCodeTaken(code: string, excludeId?: string): Promise<boolean>;
}

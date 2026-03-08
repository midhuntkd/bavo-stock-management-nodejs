import { Document, Model } from 'mongoose';

export interface IPermission {
  key: string;
  description: string;
  group: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPermissionDoc extends IPermission, Document {}

export interface IPermissionModel extends Model<IPermissionDoc> {}

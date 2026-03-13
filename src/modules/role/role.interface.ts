import { Document, Model } from 'mongoose';

export interface IRole {
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleDoc extends IRole, Document {}

export interface IRoleModel extends Model<IRoleDoc> {
  isCodeTaken(code: string, excludeId?: string): Promise<boolean>;
}

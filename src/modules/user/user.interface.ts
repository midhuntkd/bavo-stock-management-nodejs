import { Document, Model, Types } from 'mongoose';

export interface IUser {
  accessId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId: Types.ObjectId;
  roleCode: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserDoc extends IUser, Document, IUserMethods {}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
}

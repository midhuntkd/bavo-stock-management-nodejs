import { Document, Model, Types } from 'mongoose';
import { Role } from '../../configs/roles';

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdBy?: Types.ObjectId;
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

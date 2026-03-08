import { Document, Model, Types } from 'mongoose';

export interface IToken {
  token: string;
  user: Types.ObjectId;
  type: 'refresh';
  expires: Date;
  blacklisted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITokenDoc extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDoc> {}

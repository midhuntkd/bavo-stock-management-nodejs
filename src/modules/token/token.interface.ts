import { Document, Model, Types } from 'mongoose';

export type TokenType = 'refresh' | 'reset_password';

export interface IToken {
  token: string;
  user: Types.ObjectId;
  type: TokenType;
  expires: Date;
  blacklisted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITokenDoc extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDoc> {}

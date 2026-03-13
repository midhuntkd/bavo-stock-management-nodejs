import mongoose, { Schema } from 'mongoose';
import { ITokenDoc, ITokenModel } from './token.interface';

const tokenSchema = new Schema<ITokenDoc, ITokenModel>(
  {
    token: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['refresh', 'reset_password'], required: true, index: true },
    expires: { type: Date, required: true },
    blacklisted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

tokenSchema.index({ token: 1, type: 1 }, { unique: true });

const Token = mongoose.model<ITokenDoc, ITokenModel>('Token', tokenSchema);

export default Token;

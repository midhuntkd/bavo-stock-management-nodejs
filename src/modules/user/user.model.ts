import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../configs/config';
import { IUserDoc, IUserModel } from './user.interface';

const userSchema = new Schema<IUserDoc, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, trim: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    roleCode: { type: String, required: true, lowercase: true, index: true },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ roleCode: 1, isActive: 1 });

userSchema.pre('save', async function save(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);
  }
  next();
});

userSchema.methods.isPasswordMatch = async function isPasswordMatch(password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.isEmailTaken = async function isEmailTaken(email: string, excludeUserId?: string) {
  const user = await this.findOne({ email, ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}) });
  return !!user;
};

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema);

export default User;

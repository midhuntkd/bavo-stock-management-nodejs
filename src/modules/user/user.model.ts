import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { roles } from '../../configs/roles';
import { IUserDoc, IUserModel } from './user.interface';

const userSchema = new Schema<IUserDoc, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, trim: true },
    role: { type: String, enum: roles, required: true, default: 'admin' },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre('save', async function save(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
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

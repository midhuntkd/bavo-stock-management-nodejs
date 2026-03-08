import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';
import * as PermissionService from '../permission/permission.service';
import User from './user.model';
import { CreateAdminDTO, ResetAdminPasswordDTO, SafeUser, UpdateAdminDTO, UpdateAdminStatusDTO } from './user.types';

const safeUser = (user: any): SafeUser => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  permissions: user.permissions || [],
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdBy: user.createdBy ? String(user.createdBy) : undefined,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const createAdmin = async (payload: CreateAdminDTO, actorId: string) => {
  const emailTaken = await User.isEmailTaken(payload.email);
  if (emailTaken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const permissions = payload.permissions || [];
  const { allowed, unknown } = await PermissionService.validatePermissionKeys(permissions);
  if (unknown.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid permissions', true, unknown);
  }

  const user = await User.create({
    ...payload,
    role: 'admin',
    permissions: allowed,
    createdBy: new Types.ObjectId(actorId),
  });

  return safeUser(user);
};

export const listAdmins = async (query: Record<string, any>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(1, Math.min(Number(query.limit) || 20, 100));
  const skip = (page - 1) * limit;

  const filter: any = { role: 'admin' };
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [rows, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    data: rows.map(safeUser),
    meta: { page, limit, total },
  };
};

export const getAdminById = async (id: string) => {
  const admin = await User.findOne({ _id: id, role: 'admin' });
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin user not found');
  }
  return safeUser(admin);
};

export const updateAdmin = async (id: string, payload: UpdateAdminDTO) => {
  const admin = await User.findOne({ _id: id, role: 'admin' });
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin user not found');
  }

  if (payload.email && payload.email !== admin.email) {
    const emailTaken = await User.isEmailTaken(payload.email, id);
    if (emailTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }

  if (payload.permissions) {
    const { allowed, unknown } = await PermissionService.validatePermissionKeys(payload.permissions);
    if (unknown.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid permissions', true, unknown);
    }
    admin.permissions = allowed;
  }

  if (typeof payload.name !== 'undefined') admin.name = payload.name;
  if (typeof payload.email !== 'undefined') admin.email = payload.email;
  if (typeof payload.phone !== 'undefined') admin.phone = payload.phone;

  await admin.save();
  return safeUser(admin);
};

export const updateAdminStatus = async (id: string, payload: UpdateAdminStatusDTO) => {
  const admin = await User.findOneAndUpdate({ _id: id, role: 'admin' }, { isActive: payload.isActive }, { new: true });
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin user not found');
  }
  return safeUser(admin);
};

export const resetAdminPassword = async (id: string, payload: ResetAdminPasswordDTO) => {
  const admin = await User.findOne({ _id: id, role: 'admin' });
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin user not found');
  }
  admin.password = payload.password;
  await admin.save();
  return { _id: String(admin._id) };
};

export const updateAdminPermissions = async (id: string, permissions: string[]) => {
  const admin = await User.findOne({ _id: id, role: 'admin' });
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin user not found');
  }

  const { allowed, unknown } = await PermissionService.validatePermissionKeys(permissions);
  if (unknown.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid permissions', true, unknown);
  }

  admin.permissions = allowed;
  await admin.save();
  return safeUser(admin);
};

export const findByEmail = async (email: string) => User.findOne({ email });

export const findById = async (id: string) => User.findById(id);

export const updateLastLoginAt = async (id: string) =>
  User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true });

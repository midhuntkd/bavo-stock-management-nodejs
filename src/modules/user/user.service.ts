import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';
import { Role, RoleService } from '../role';
import User from './user.model';
import { ChangePasswordDTO, CreateUserDTO, ResetPasswordDTO, UpdateUserDTO } from './user.types';

const sanitizeUser = (user: any) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  roleId: String(user.roleId),
  roleCode: user.roleCode,
  permissions: user.permissions || [],
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getRoleByCode = async (roleCode: string) => {
  const code = roleCode.trim().toLowerCase();
  const role = await Role.findOne({ code, isActive: true });
  if (!role) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Role not found for code: ${code}`);
  }
  return role;
};

const normalizePermissionCodes = (payload: Pick<CreateUserDTO, 'permissions' | 'permissionsCsv'>) => {
  if (typeof payload.permissions === 'undefined' && typeof payload.permissionsCsv === 'undefined') {
    return undefined;
  }

  const csvPermissions = typeof payload.permissionsCsv === 'string' ? payload.permissionsCsv.split(',') : [];
  const arrayPermissions = Array.isArray(payload.permissions) ? payload.permissions : [];

  return [...new Set([...arrayPermissions, ...csvPermissions].map((code) => code.trim().toLowerCase()).filter(Boolean))];
};

export const createUser = async (payload: CreateUserDTO, actorId: string) => {
  if (await User.isEmailTaken(payload.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const role = await getRoleByCode(payload.roleCode);
  const permissions = normalizePermissionCodes(payload) || [];
  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    roleId: role._id,
    roleCode: role.code,
    permissions,
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : true,
    createdBy: new Types.ObjectId(actorId),
    updatedBy: new Types.ObjectId(actorId),
  });

  return sanitizeUser(user);
};

export const listUsers = async (query: Record<string, any>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(1, Math.min(Number(query.limit) || 20, 100));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.roleCode) filter.roleCode = String(query.roleCode).toLowerCase();
  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [rows, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    items: rows.map(sanitizeUser),
    pagination: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  const rolePermissions = await RoleService.getRolePermissionCodes(String(user.roleId));
  const effectivePermissions = user.roleCode === 'super_admin' ? ['*'] : [...new Set([...rolePermissions, ...user.permissions])];
  return { ...sanitizeUser(user), effectivePermissions };
};

export const updateUser = async (id: string, payload: UpdateUserDTO, actorId: string) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  if (payload.email && payload.email !== user.email) {
    if (await User.isEmailTaken(payload.email, id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }

  if (payload.roleCode) {
    const role = await getRoleByCode(payload.roleCode);
    user.roleId = role._id as any;
    user.roleCode = role.code;
  }

  if (typeof payload.name !== 'undefined') user.name = payload.name;
  if (typeof payload.email !== 'undefined') user.email = payload.email;
  if (typeof payload.phone !== 'undefined') user.phone = payload.phone;
  const permissions = normalizePermissionCodes(payload);
  if (typeof permissions !== 'undefined') user.permissions = permissions;
  if (typeof payload.isActive !== 'undefined') user.isActive = payload.isActive;

  user.updatedBy = new Types.ObjectId(actorId);
  await user.save();
  return sanitizeUser(user);
};

export const resetUserPassword = async (id: string, payload: ResetPasswordDTO, actorId: string) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  user.password = payload.password;
  user.updatedBy = new Types.ObjectId(actorId);
  await user.save();
  return { _id: String(user._id) };
};

export const changeOwnPassword = async (userId: string, payload: ChangePasswordDTO) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const matched = await user.isPasswordMatch(payload.currentPassword);
  if (!matched) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Current password is incorrect');
  }

  user.password = payload.newPassword;
  await user.save();
  return { _id: String(user._id) };
};

export const findByEmail = async (email: string) => User.findOne({ email: email.toLowerCase() });
export const findById = async (id: string) => User.findById(id);
export const updateLastLoginAt = async (id: string) => User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true });

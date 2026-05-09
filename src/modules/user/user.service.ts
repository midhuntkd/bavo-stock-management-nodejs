import httpStatus from 'http-status';
import { randomInt } from 'crypto';
import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';
import logger from '../logger/logger';
import { Role, RoleService } from '../role';
import { sendMail } from '../utils';
import User from './user.model';
import { ChangePasswordDTO, CreateUserDTO, ResetPasswordByEmailDTO, ResetPasswordDTO, UpdateUserDTO } from './user.types';

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

const buildRandomPassword = (length = 12) => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#$%&*!?';
  const all = `${upper}${lower}${digits}${symbols}`;

  const chars = [
    upper[randomInt(upper.length)],
    lower[randomInt(lower.length)],
    digits[randomInt(digits.length)],
    symbols[randomInt(symbols.length)],
  ];

  while (chars.length < length) {
    chars.push(all[randomInt(all.length)]);
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
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
  if (typeof payload.password === 'string' && payload.password.trim()) user.password = payload.password;
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
  if (user.roleCode === 'super_admin') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Super admin password cannot be reset from this API');
  }
  user.password = payload.password;
  user.updatedBy = new Types.ObjectId(actorId);
  await user.save();
  return { _id: String(user._id) };
};

export const resetUserPasswordByEmail = async (payload: ResetPasswordByEmailDTO, actorId: string) => {
  const email = payload.email.trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.roleCode === 'super_admin') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Super admin password cannot be reset from this API');
  }

  const generatedPassword = buildRandomPassword();
  const previousHashedPassword = user.password;

  user.password = generatedPassword;
  user.updatedBy = new Types.ObjectId(actorId);
  await user.save();

  try {
    await sendMail({
      to: user.email,
      subject: `${user.name || 'User'} password reset`,
      text: `Hello ${user.name || 'User'}, your password has been reset. Your new temporary password is: ${generatedPassword}`,
      html: `
        <p>Hello ${user.name || 'User'},</p>
        <p>Your password has been reset by the administrator.</p>
        <p>Your new temporary password is:</p>
        <p><strong>${generatedPassword}</strong></p>
        <p>Please sign in and change this password immediately.</p>
      `,
    });
  } catch (error: any) {
    await User.updateOne(
      { _id: user._id },
      { password: previousHashedPassword, updatedBy: new Types.ObjectId(actorId) }
    );

    const mailErrorMessage = error instanceof Error ? error.message : 'Unknown SMTP error';
    logger.error(`Password reset email failed for ${user.email}: ${mailErrorMessage}`);

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Password reset email could not be sent', true, {
      cause: mailErrorMessage,
    });
  }

  return { _id: String(user._id), email: user.email };
};

export const changeOwnPassword = async (userId: string, payload: ChangePasswordDTO) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const oldPassword = payload.previousPassword ?? payload.currentPassword;
  const nextPassword = payload.newPassword ?? payload.currentPassword;

  const matched = await user.isPasswordMatch(oldPassword);
  if (!matched) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Previous password is incorrect');
  }

  user.password = nextPassword;
  user.updatedBy = new Types.ObjectId(userId);
  await user.save();
  return { _id: String(user._id) };
};

export const findByEmail = async (email: string) => User.findOne({ email: email.toLowerCase() });
export const findById = async (id: string) => User.findById(id);
export const updateLastLoginAt = async (id: string) => User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true });

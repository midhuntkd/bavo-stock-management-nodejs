import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import * as TokenService from '../token/token.service';
import { Token } from '../token';
import { RoleService } from '../role';
import * as UserService from '../user/user.service';

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  const user = await UserService.findByEmail(email);

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is inactive');
  }

  await UserService.updateLastLoginAt(String(user._id));
  const tokens = await TokenService.generateAuthTokens(user._id as any);
  const rolePermissions = await RoleService.getRolePermissionCodes(String(user.roleId));

  return {
    user: {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: String(user.roleId),
      roleCode: user.roleCode,
      permissions: user.permissions,
      effectivePermissions:
        user.roleCode === 'super_admin' ? ['*'] : [...new Set([...rolePermissions, ...user.permissions])],
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    },
    tokens,
  };
};

export const refreshAuth = async (refreshToken: string) => {
  let payload: { sub: string };
  let tokenDoc: any;
  try {
    const verified = await TokenService.verifyRefreshToken(refreshToken);
    payload = verified.payload;
    tokenDoc = verified.tokenDoc;
  } catch (_error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const user = await UserService.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found or inactive');
  }

  await tokenDoc.deleteOne();
  const tokens = await TokenService.generateAuthTokens(user._id as any);
  return { tokens };
};

export const logout = async (refreshToken: string) => {
  await Token.findOneAndDelete({ token: refreshToken, type: 'refresh' });
};

export const getMe = async (userId: string) => {
  const user = await UserService.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const rolePermissions = await RoleService.getRolePermissionCodes(String(user.roleId));
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    roleId: String(user.roleId),
    roleCode: user.roleCode,
    permissions: user.permissions,
    effectivePermissions: user.roleCode === 'super_admin' ? ['*'] : [...new Set([...rolePermissions, ...user.permissions])],
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
  };
};

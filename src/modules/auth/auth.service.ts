import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import * as UserService from '../user/user.service';
import * as TokenService from '../token/token.service';
import { Token } from '../token';

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

  return {
    user: {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    },
    tokens,
  };
};

export const refreshAuth = async (refreshToken: string) => {
  const { payload, tokenDoc } = await TokenService.verifyRefreshToken(refreshToken);

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

  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
  };
};

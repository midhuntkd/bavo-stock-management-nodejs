import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as AuthService from './auth.service';

export const login: RequestHandler = catchAsync(async (req, res) => {
  const data = await AuthService.loginWithEmailAndPassword(req.body.email, req.body.password);
  sendSuccess(res, 'Login successful', data);
});

export const refreshTokens: RequestHandler = catchAsync(async (req, res) => {
  const data = await AuthService.refreshAuth(req.body.refreshToken);
  sendSuccess(res, 'Token refreshed successfully', data);
});

export const logout: RequestHandler = catchAsync(async (req, res) => {
  await AuthService.logout(req.body.refreshToken);
  sendSuccess(res, 'Logout successful');
});

export const me: RequestHandler = catchAsync(async (req, res) => {
  const data = await AuthService.getMe(String(req.user?._id));
  sendSuccess(res, 'Profile fetched successfully', data);
});

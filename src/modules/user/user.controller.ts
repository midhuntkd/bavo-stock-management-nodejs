import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as UserService from './user.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.createUser(req.body, String(req.user?._id));
  sendSuccess(res, 'User created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.listUsers(req.query as Record<string, any>);
  sendSuccess(res, 'Users fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.getUserById(String(req.params.id));
  sendSuccess(res, 'User fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.updateUser(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'User updated successfully', data);
});

export const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.resetUserPassword(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'User password reset successfully', data);
});

export const resetPasswordByEmail: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.resetUserPasswordByEmail(req.body, String(req.user?._id));
  sendSuccess(res, 'User password reset and emailed successfully', data);
});

export const changeMyPassword: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.changeOwnPassword(String(req.user?._id), req.body);
  sendSuccess(res, 'Password changed successfully', data);
});

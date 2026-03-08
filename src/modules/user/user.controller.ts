import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as UserService from './user.service';

export const createAdmin: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.createAdmin(req.body, String(req.user?._id));
  sendSuccess(res, 'Admin user created successfully', data, 201);
});

export const listAdmins: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserService.listAdmins(req.query as Record<string, any>);
  sendSuccess(res, 'Admin users fetched successfully', result.data, 200, result.meta);
});

export const getAdminById: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.getAdminById(String(req.params.id));
  sendSuccess(res, 'Admin user fetched successfully', data);
});

export const updateAdmin: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.updateAdmin(String(req.params.id), req.body);
  sendSuccess(res, 'Admin user updated successfully', data);
});

export const updateAdminStatus: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.updateAdminStatus(String(req.params.id), req.body);
  sendSuccess(res, 'Admin user status updated successfully', data);
});

export const resetAdminPassword: RequestHandler = catchAsync(async (req, res) => {
  await UserService.resetAdminPassword(String(req.params.id), req.body);
  sendSuccess(res, 'Admin user password reset successfully');
});

export const updateAdminPermissions: RequestHandler = catchAsync(async (req, res) => {
  const data = await UserService.updateAdminPermissions(String(req.params.id), req.body.permissions);
  sendSuccess(res, 'Admin user permissions updated successfully', data);
});

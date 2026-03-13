import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as PermissionService from './permission.service';

export const list: RequestHandler = catchAsync(async (_req, res) => {
  const data = await PermissionService.listAllPermissions();
  sendSuccess(res, 'Permissions fetched successfully', data);
});

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await PermissionService.createPermission(req.body);
  sendSuccess(res, 'Permission created successfully', data, 201);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await PermissionService.updatePermission(String(req.params.id), req.body);
  sendSuccess(res, 'Permission updated successfully', data);
});

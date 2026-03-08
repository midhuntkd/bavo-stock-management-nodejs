import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as PermissionService from './permission.service';

export const list: RequestHandler = catchAsync(async (_req, res) => {
  const permissions = await PermissionService.listPermissions();
  sendSuccess(res, 'Permissions fetched successfully', permissions);
});

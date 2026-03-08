import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as RoleService from './role.service';

export const list: RequestHandler = catchAsync(async (_req, res) => {
  const data = await RoleService.listRoles();
  sendSuccess(res, 'Roles fetched successfully', data);
});

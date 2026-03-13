import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as RoleService from './role.service';

export const list: RequestHandler = catchAsync(async (_req, res) => {
  const data = await RoleService.listRoles();
  sendSuccess(res, 'Roles fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await RoleService.getRoleById(String(req.params.id));
  sendSuccess(res, 'Role fetched successfully', data);
});

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await RoleService.createRole(req.body);
  sendSuccess(res, 'Role created successfully', data, 201);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await RoleService.updateRole(String(req.params.id), req.body);
  sendSuccess(res, 'Role updated successfully', data);
});

export const setPermissions: RequestHandler = catchAsync(async (req, res) => {
  const data = await RoleService.setRolePermissions(String(req.params.id), req.body.permissionCodes);
  sendSuccess(res, 'Role permissions updated successfully', data);
});

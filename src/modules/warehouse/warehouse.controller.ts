import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as WarehouseService from './warehouse.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await WarehouseService.createWarehouse(req.body, String((req as any).user?._id));
  sendSuccess(res, 'Warehouse created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const result = await WarehouseService.listWarehouses(req.query as Record<string, any>);
  sendSuccess(res, 'Warehouses fetched successfully', result.data, 200, result.meta);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await WarehouseService.getWarehouseById(String(req.params.id));
  sendSuccess(res, 'Warehouse fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await WarehouseService.updateWarehouse(String(req.params.id), req.body);
  sendSuccess(res, 'Warehouse updated successfully', data);
});

export const deactivate: RequestHandler = catchAsync(async (req, res) => {
  const data = await WarehouseService.deactivateWarehouse(String(req.params.id));
  sendSuccess(res, 'Warehouse deactivated successfully', data);
});

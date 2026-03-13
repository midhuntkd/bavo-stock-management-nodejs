import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as WarehouseLocationService from './warehouse-location.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await WarehouseLocationService.createLocation(req.body);
  sendSuccess(res, 'Warehouse location created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await WarehouseLocationService.listLocations(req.query as Record<string, any>);
  sendSuccess(res, 'Warehouse locations fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await WarehouseLocationService.updateLocation(String(req.params.id), req.body);
  sendSuccess(res, 'Warehouse location updated successfully', data);
});

export const setActiveState: RequestHandler = catchAsync(async (req, res) => {
  const data = await WarehouseLocationService.setLocationActiveState(String(req.params.id), Boolean(req.body.isActive));
  sendSuccess(res, 'Warehouse location status updated successfully', data);
});

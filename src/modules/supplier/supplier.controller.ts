import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as SupplierService from './supplier.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await SupplierService.createSupplier(req.body);
  sendSuccess(res, 'Supplier created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await SupplierService.listSuppliers(req.query as Record<string, any>);
  sendSuccess(res, 'Suppliers fetched successfully', data);
});

export const options: RequestHandler = catchAsync(async (req, res) => {
  const data = await SupplierService.listSupplierOptions(req.query as Record<string, any>);
  sendSuccess(res, 'Supplier options fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await SupplierService.getSupplierById(String(req.params.id), req.query as Record<string, any>);
  sendSuccess(res, 'Supplier fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await SupplierService.updateSupplier(String(req.params.id), req.body);
  sendSuccess(res, 'Supplier updated successfully', data);
});

export const setActiveState: RequestHandler = catchAsync(async (req, res) => {
  const data = await SupplierService.setSupplierActiveState(String(req.params.id), Boolean(req.body.isActive));
  sendSuccess(res, 'Supplier status updated successfully', data);
});

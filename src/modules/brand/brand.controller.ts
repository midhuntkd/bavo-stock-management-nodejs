import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as BrandService from './brand.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.createBrand(req.body, String(req.user?._id));
  sendSuccess(res, 'Brand created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.listBrands(req.query as Record<string, any>);
  sendSuccess(res, 'Brands fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.getBrandById(String(req.params.id));
  sendSuccess(res, 'Brand fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.updateBrand(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Brand updated successfully', data);
});

export const updateStatus: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.updateBrandStatus(String(req.params.id), Boolean(req.body.isActive), String(req.user?._id));
  sendSuccess(res, 'Brand status updated successfully', data);
});

export const bySupplier: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.listBrandsBySupplier(String(req.params.supplierId));
  sendSuccess(res, 'Brands fetched successfully', data);
});

export const options: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.listBrandOptions(req.query as Record<string, any>);
  sendSuccess(res, 'Brand options fetched successfully', data);
});

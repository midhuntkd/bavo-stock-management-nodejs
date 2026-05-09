import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as ProductService from './product.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await ProductService.createProduct(req.body);
  sendSuccess(res, 'Product created successfully', data, 201);
});

export const importJson: RequestHandler = catchAsync(async (req, res) => {
  let payload: any = req.body;

  if (req.file?.buffer) {
    payload = JSON.parse(req.file.buffer.toString('utf-8'));
  }

  const data = await ProductService.importProducts(payload);
  sendSuccess(res, 'Products imported successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await ProductService.listProducts(req.query as Record<string, any>);
  sendSuccess(res, 'Products fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await ProductService.getProductById(String(req.params.id));
  sendSuccess(res, 'Product fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await ProductService.updateProduct(String(req.params.id), req.body);
  sendSuccess(res, 'Product updated successfully', data);
});

export const setActiveState: RequestHandler = catchAsync(async (req, res) => {
  const data = await ProductService.setProductActiveState(String(req.params.id), Boolean(req.body.isActive));
  sendSuccess(res, 'Product status updated successfully', data);
});

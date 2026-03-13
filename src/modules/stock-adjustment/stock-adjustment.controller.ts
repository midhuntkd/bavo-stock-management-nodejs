import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as StockAdjustmentService from './stock-adjustment.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockAdjustmentService.createAdjustment(req.body, String(req.user?._id));
  sendSuccess(res, 'Stock adjustment created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockAdjustmentService.listAdjustments(req.query as Record<string, any>);
  sendSuccess(res, 'Stock adjustments fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockAdjustmentService.getAdjustmentById(String(req.params.id));
  sendSuccess(res, 'Stock adjustment fetched successfully', data);
});

export const apply: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockAdjustmentService.applyStockAdjustment(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Stock adjustment applied successfully', data);
});

import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as StockService from './stock.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.createStockRecord(req.body);
  sendSuccess(res, 'Stock record created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.listStocks(req.query as Record<string, any>);
  sendSuccess(res, 'Stock records fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.getStockById(String(req.params.id));
  sendSuccess(res, 'Stock record fetched successfully', data);
});

export const lowStock: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.lowStockList(req.query.warehouseId as string | undefined);
  sendSuccess(res, 'Low stock list fetched successfully', data);
});

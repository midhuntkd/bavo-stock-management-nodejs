import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as StockService from './stock.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.createStock(req.body, String(req.user?._id), req.file);
  sendSuccess(res, 'Stock item created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const result = await StockService.listStocks(req.query as Record<string, any>);
  sendSuccess(res, 'Stock items fetched successfully', result.data, 200, result.meta);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.getStockById(String(req.params.id));
  sendSuccess(res, 'Stock item fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.updateStock(String(req.params.id), req.body, String(req.user?._id), req.file);
  sendSuccess(res, 'Stock item updated successfully', data);
});

export const stockIn: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.stockIn(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Stock in successful', data);
});

export const stockOut: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.stockOut(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Stock out successful', data);
});

export const adjust: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.stockAdjust(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Stock adjusted successfully', data);
});

export const transfer: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.transferStock(req.body, String(req.user?._id));
  sendSuccess(res, 'Stock transferred successfully', data);
});

export const reserve: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.reserveStock(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Stock reserved successfully', data);
});

export const release: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockService.releaseStock(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Stock released successfully', data);
});

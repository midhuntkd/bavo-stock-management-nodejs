import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as StockBatchService from './stock-batch.service';

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockBatchService.listBatches(req.query as Record<string, any>);
  sendSuccess(res, 'Stock batches fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockBatchService.getBatchById(String(req.params.id));
  sendSuccess(res, 'Stock batch fetched successfully', data);
});

export const markStatus: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockBatchService.updateBatchStatus(String(req.params.id), req.body.status);
  sendSuccess(res, 'Stock batch status updated successfully', data);
});

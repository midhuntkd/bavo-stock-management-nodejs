import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as StockTransferService from './stock-transfer.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockTransferService.createTransfer(req.body, String(req.user?._id));
  sendSuccess(res, 'Stock transfer created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockTransferService.listTransfers(req.query as Record<string, any>);
  sendSuccess(res, 'Stock transfers fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockTransferService.getTransferById(String(req.params.id));
  sendSuccess(res, 'Stock transfer fetched successfully', data);
});

export const dispatch: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockTransferService.executeStockTransfer(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Stock transfer dispatched successfully', data);
});

export const receive: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockTransferService.receiveTransfer(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Stock transfer received successfully', data);
});

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockTransferService.cancelTransfer(String(req.params.id));
  sendSuccess(res, 'Stock transfer cancelled successfully', data);
});

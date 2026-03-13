import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { catchAsync, sendSuccess } from '../utils';
import * as StockMovementService from './stock-movement.service';

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockMovementService.listMovements(req.query as Record<string, any>);
  sendSuccess(res, 'Stock movements fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockMovementService.getMovementById(String(req.params.id));
  if (!data) throw new ApiError(httpStatus.NOT_FOUND, 'Stock movement not found');
  sendSuccess(res, 'Stock movement fetched successfully', data);
});

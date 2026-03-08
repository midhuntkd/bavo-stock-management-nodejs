import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as StockMovementService from './stock-movement.service';

export const list: RequestHandler = catchAsync(async (req, res) => {
  const result = await StockMovementService.listMovements(req.query as Record<string, any>);
  sendSuccess(res, 'Stock movements fetched successfully', result.data, 200, result.meta);
});

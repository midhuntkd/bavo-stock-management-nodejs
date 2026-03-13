import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as StockReservationService from './stock-reservation.service';

export const reserve: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockReservationService.reserveStock({ ...req.body, createdBy: String(req.user?._id) });
  sendSuccess(res, 'Stock reserved successfully', data, 201);
});

export const release: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockReservationService.releaseStock(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Reserved stock released successfully', data);
});

export const consume: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockReservationService.consumeReservedStock(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Reserved stock consumed successfully', data);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await StockReservationService.listReservations(req.query as Record<string, any>);
  sendSuccess(res, 'Stock reservations fetched successfully', data);
});

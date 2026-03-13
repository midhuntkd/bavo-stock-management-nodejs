import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as GRNService from './goods-receipt-note.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await GRNService.createGRN(req.body);
  sendSuccess(res, 'GRN created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await GRNService.listGRN(req.query as Record<string, any>);
  sendSuccess(res, 'GRN records fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await GRNService.getGRNById(String(req.params.id));
  sendSuccess(res, 'GRN fetched successfully', data);
});

export const receive: RequestHandler = catchAsync(async (req, res) => {
  const data = await GRNService.applyGRNReceipt(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'GRN received successfully', data);
});

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const data = await GRNService.cancelGRN(String(req.params.id));
  sendSuccess(res, 'GRN cancelled successfully', data);
});

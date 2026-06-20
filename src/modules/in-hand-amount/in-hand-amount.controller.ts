import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as InHandAmountService from './in-hand-amount.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await InHandAmountService.createInHandAmount(req.body, String(req.user?._id));
  sendSuccess(res, 'In-hand amount created successfully', data, 201);
});

export const frontendCreate: RequestHandler = catchAsync(async (req, res) => {
  const data = await InHandAmountService.createOwnInHandAmount(req.body, String(req.user?._id));
  sendSuccess(res, 'In-hand amount created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await InHandAmountService.listInHandAmounts(req.query as Record<string, any>);
  sendSuccess(res, 'In-hand amounts fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await InHandAmountService.getInHandAmountById(String(req.params.id));
  sendSuccess(res, 'In-hand amount fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await InHandAmountService.updateInHandAmount(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'In-hand amount updated successfully', data);
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  const data = await InHandAmountService.deleteInHandAmount(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'In-hand amount deleted successfully', data);
});

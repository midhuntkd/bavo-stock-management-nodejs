import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as CycleCountService from './cycle-count.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await CycleCountService.createCycleCount(req.body, String(req.user?._id));
  sendSuccess(res, 'Cycle count created', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await CycleCountService.listCycleCounts(req.query as Record<string, any>);
  sendSuccess(res, 'Cycle counts fetched', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await CycleCountService.getCycleCountById(String(req.params['id']));
  sendSuccess(res, 'Cycle count fetched', data);
});

export const start: RequestHandler = catchAsync(async (req, res) => {
  const data = await CycleCountService.startCycleCount(String(req.params['id']));
  sendSuccess(res, 'Cycle count started', data);
});

export const submit: RequestHandler = catchAsync(async (req, res) => {
  const data = await CycleCountService.submitCycleCount(
    String(req.params['id']),
    req.body.counts,
    String(req.user?._id)
  );
  sendSuccess(res, 'Cycle count submitted — draft stock adjustment generated for variances', data);
});

export const reconcile: RequestHandler = catchAsync(async (req, res) => {
  const data = await CycleCountService.reconcileCycleCount(String(req.params['id']), String(req.user?._id));
  sendSuccess(res, 'Cycle count reconciled', data);
});

export const updateItem: RequestHandler = catchAsync(async (req, res) => {
  const data = await CycleCountService.updateItemCount(
    String(req.params['id']),
    String(req.params['itemId']),
    req.body.countedQty,
    req.body.note
  );
  sendSuccess(res, 'Item count updated', data);
});

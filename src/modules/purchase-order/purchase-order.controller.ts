import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as PurchaseOrderService from './purchase-order.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await PurchaseOrderService.createPurchaseOrder(req.body, String(req.user?._id));
  sendSuccess(res, 'Purchase order created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await PurchaseOrderService.listPurchaseOrders(req.query as Record<string, any>);
  sendSuccess(res, 'Purchase orders fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await PurchaseOrderService.getPurchaseOrderById(String(req.params.id));
  sendSuccess(res, 'Purchase order fetched successfully', data);
});

export const updateDraft: RequestHandler = catchAsync(async (req, res) => {
  const data = await PurchaseOrderService.updateDraftPurchaseOrder(String(req.params.id), req.body);
  sendSuccess(res, 'Purchase order updated successfully', data);
});

export const approve: RequestHandler = catchAsync(async (req, res) => {
  const data = await PurchaseOrderService.approvePurchaseOrder(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Purchase order approved successfully', data);
});

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const data = await PurchaseOrderService.cancelPurchaseOrder(String(req.params.id));
  sendSuccess(res, 'Purchase order cancelled successfully', data);
});

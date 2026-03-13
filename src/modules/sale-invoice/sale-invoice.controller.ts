import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as SaleInvoiceService from './sale-invoice.service';

export const createDraft: RequestHandler = catchAsync(async (req, res) => {
  const data = await SaleInvoiceService.createDraftInvoice(req.body, String(req.user?._id));
  sendSuccess(res, 'Sale invoice draft created successfully', data, 201);
});

export const confirm: RequestHandler = catchAsync(async (req, res) => {
  const data = await SaleInvoiceService.confirmSaleInvoice(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Sale invoice confirmed successfully', data);
});

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const data = await SaleInvoiceService.cancelInvoice(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Sale invoice cancelled successfully', data);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await SaleInvoiceService.listInvoices(req.query as Record<string, any>);
  sendSuccess(res, 'Sale invoices fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await SaleInvoiceService.getInvoiceById(String(req.params.id));
  sendSuccess(res, 'Sale invoice fetched successfully', data);
});

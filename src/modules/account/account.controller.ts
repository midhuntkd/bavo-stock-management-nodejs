import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as AccountService from './account.service';

export const create: RequestHandler = catchAsync(async (req, res) => {
  const data = await AccountService.createAccount(req.body, String(req.user?._id));
  sendSuccess(res, 'Account created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await AccountService.listAccounts(req.query as Record<string, any>);
  sendSuccess(res, 'Accounts fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await AccountService.getAccountById(String(req.params.id));
  sendSuccess(res, 'Account fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const data = await AccountService.updateAccount(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Account updated successfully', data);
});

export const updateStatus: RequestHandler = catchAsync(async (req, res) => {
  const data = await AccountService.updateAccountStatus(String(req.params.id), Boolean(req.body.isActive), String(req.user?._id));
  sendSuccess(res, 'Account status updated successfully', data);
});

export const summary: RequestHandler = catchAsync(async (req, res) => {
  const data = await AccountService.getAccountSummary(req.query as Record<string, any>);
  sendSuccess(res, 'Account summary fetched successfully', data);
});

export const statement: RequestHandler = catchAsync(async (req, res) => {
  const data = await AccountService.generateAccountStatement(String(req.params.id), req.query as Record<string, any>);
  sendSuccess(res, 'Account statement fetched successfully', data);
});
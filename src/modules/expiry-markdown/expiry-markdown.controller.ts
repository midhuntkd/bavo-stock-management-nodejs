import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as ExpiryMarkdownService from './expiry-markdown.service';

export const createRule: RequestHandler = catchAsync(async (req, res) => {
  const data = await ExpiryMarkdownService.createRule(req.body);
  sendSuccess(res, 'Markdown rule created', data, 201);
});

export const listRules: RequestHandler = catchAsync(async (req, res) => {
  const data = await ExpiryMarkdownService.listRules(req.query as Record<string, any>);
  sendSuccess(res, 'Markdown rules fetched', data);
});

export const getRuleById: RequestHandler = catchAsync(async (req, res) => {
  const data = await ExpiryMarkdownService.getRuleById(String(req.params['id']));
  sendSuccess(res, 'Markdown rule fetched', data);
});

export const updateRule: RequestHandler = catchAsync(async (req, res) => {
  const data = await ExpiryMarkdownService.updateRule(String(req.params['id']), req.body);
  sendSuccess(res, 'Markdown rule updated', data);
});

export const deleteRule: RequestHandler = catchAsync(async (req, res) => {
  await ExpiryMarkdownService.deleteRule(String(req.params['id']));
  sendSuccess(res, 'Markdown rule deleted', null);
});

export const runJob: RequestHandler = catchAsync(async (req, res) => {
  const { warehouseId, dryRun } = req.body;
  const result = await ExpiryMarkdownService.runExpiryMarkdownJob(warehouseId, dryRun === true);
  sendSuccess(res, dryRun ? 'Dry run complete — no changes saved' : 'Expiry markdown job completed', result);
});

export const listLogs: RequestHandler = catchAsync(async (req, res) => {
  const data = await ExpiryMarkdownService.listMarkdownLogs(req.query as Record<string, any>);
  sendSuccess(res, 'Markdown logs fetched', data);
});

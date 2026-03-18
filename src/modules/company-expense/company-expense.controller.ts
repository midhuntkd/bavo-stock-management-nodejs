import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { uploadImageToS3 } from '../utils/s3';
import { catchAsync, sendSuccess } from '../utils';
import * as CompanyExpenseService from './company-expense.service';

const ensureS3Configured = () => {
  if (!config.aws.region || !config.aws.accessKeyId || !config.aws.secretAccessKey || !config.aws.s3Bucket) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Image upload is not configured');
  }
};

const attachProofIfNeeded = async (req: any) => {
  if (req.file) {
    ensureS3Configured();
    const uploaded = await uploadImageToS3(req.file);
    req.body.proof = uploaded.url;
  }
};

export const create: RequestHandler = catchAsync(async (req, res) => {
  await attachProofIfNeeded(req);
  const data = await CompanyExpenseService.createCompanyExpense(req.body, String(req.user?._id));
  sendSuccess(res, 'Company expense created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await CompanyExpenseService.listCompanyExpenses(req.query as Record<string, any>);
  sendSuccess(res, 'Company expenses fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await CompanyExpenseService.getCompanyExpenseById(String(req.params.id));
  sendSuccess(res, 'Company expense fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  await attachProofIfNeeded(req);
  const data = await CompanyExpenseService.updateCompanyExpense(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Company expense updated successfully', data);
});

export const confirm: RequestHandler = catchAsync(async (req, res) => {
  const data = await CompanyExpenseService.confirmCompanyExpenseEffect(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Company expense confirmed successfully', data);
});

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const data = await CompanyExpenseService.cancelCompanyExpenseEffect(
    String(req.params.id),
    String(req.user?._id),
    undefined,
    req.body.note
  );
  sendSuccess(res, 'Company expense cancelled successfully', data);
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  const data = await CompanyExpenseService.deleteDraftCompanyExpense(String(req.params.id));
  sendSuccess(res, 'Draft company expense deleted successfully', data);
});
import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { uploadImageToS3 } from '../utils/s3';
import { catchAsync, sendSuccess } from '../utils';
import * as InvestmentService from './investment.service';

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
  const data = await InvestmentService.createInvestment(req.body, String(req.user?._id));
  sendSuccess(res, 'Investment created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await InvestmentService.listInvestments(req.query as Record<string, any>);
  sendSuccess(res, 'Investments fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await InvestmentService.getInvestmentById(String(req.params.id));
  sendSuccess(res, 'Investment fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  await attachProofIfNeeded(req);
  const data = await InvestmentService.updateInvestment(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Investment updated successfully', data);
});

export const confirm: RequestHandler = catchAsync(async (req, res) => {
  const data = await InvestmentService.confirmInvestmentEffect(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Investment confirmed successfully', data);
});

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const data = await InvestmentService.cancelInvestmentEffect(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Investment cancelled successfully', data);
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  const data = await InvestmentService.deleteDraftInvestment(String(req.params.id));
  sendSuccess(res, 'Draft investment deleted successfully', data);
});

export const summary: RequestHandler = catchAsync(async (req, res) => {
  const data = await InvestmentService.getInvestmentSummary(req.query as Record<string, any>);
  sendSuccess(res, 'Investment summary fetched successfully', data);
});
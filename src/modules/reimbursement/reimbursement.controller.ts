import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { uploadImageToS3 } from '../utils/s3';
import { catchAsync, sendSuccess } from '../utils';
import * as ReimbursementService from './reimbursement.service';

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
  const data = await ReimbursementService.applyReimbursementClearance(req.body, String(req.user?._id));
  sendSuccess(res, 'Reimbursement created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await ReimbursementService.listReimbursements(req.query as Record<string, any>);
  sendSuccess(res, 'Reimbursements fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await ReimbursementService.getReimbursementById(String(req.params.id));
  sendSuccess(res, 'Reimbursement fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  await attachProofIfNeeded(req);
  const data = await ReimbursementService.updateReimbursement(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Reimbursement updated successfully', data);
});

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const data = await ReimbursementService.cancelReimbursement(String(req.params.id), String(req.user?._id));
  sendSuccess(res, 'Reimbursement cancelled successfully', data);
});

export const monthlyHistory: RequestHandler = catchAsync(async (req, res) => {
  const data = await ReimbursementService.getMonthlyReimbursementHistory(req.query as Record<string, any>);
  sendSuccess(res, 'Monthly reimbursement history fetched successfully', data);
});
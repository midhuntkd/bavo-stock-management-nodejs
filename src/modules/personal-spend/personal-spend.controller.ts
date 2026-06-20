import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { uploadImageToS3 } from '../utils/s3';
import { catchAsync, sendSuccess } from '../utils';
import * as PersonalSpendService from './personal-spend.service';

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

const actorFromRequest = (req: any) => ({ userId: String(req.user?._id), roleCode: String(req.user?.roleCode) });
const frontendActorFromRequest = (req: any) => ({ userId: String(req.user?._id), roleCode: 'self_service' });

export const create: RequestHandler = catchAsync(async (req, res) => {
  await attachProofIfNeeded(req);
  const data = await PersonalSpendService.createPersonalSpend(req.body, actorFromRequest(req));
  sendSuccess(res, 'Personal spend created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await PersonalSpendService.listPersonalSpends(req.query as Record<string, any>, actorFromRequest(req));
  sendSuccess(res, 'Personal spends fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await PersonalSpendService.getPersonalSpendById(String(req.params.id), actorFromRequest(req));
  sendSuccess(res, 'Personal spend fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  await attachProofIfNeeded(req);
  const data = await PersonalSpendService.updatePersonalSpend(String(req.params.id), req.body, actorFromRequest(req));
  sendSuccess(res, 'Personal spend updated successfully', data);
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  const data = await PersonalSpendService.deletePersonalSpend(String(req.params.id), actorFromRequest(req));
  sendSuccess(res, 'Personal spend deleted successfully', data);
});

export const carryForward: RequestHandler = catchAsync(async (req, res) => {
  const data = await PersonalSpendService.markPersonalSpendCarriedForward(String(req.params.id), actorFromRequest(req), req.body.note);
  sendSuccess(res, 'Personal spend carried forward successfully', data);
});

export const frontendCreate: RequestHandler = catchAsync(async (req, res) => {
  await attachProofIfNeeded(req);
  const data = await PersonalSpendService.createPersonalSpend(req.body, frontendActorFromRequest(req));
  sendSuccess(res, 'Personal spend created successfully', data, 201);
});

export const frontendList: RequestHandler = catchAsync(async (req, res) => {
  const data = await PersonalSpendService.listPersonalSpends(req.query as Record<string, any>, frontendActorFromRequest(req));
  sendSuccess(res, 'Personal spends fetched successfully', data);
});

export const frontendGetById: RequestHandler = catchAsync(async (req, res) => {
  const data = await PersonalSpendService.getPersonalSpendById(String(req.params.id), frontendActorFromRequest(req));
  sendSuccess(res, 'Personal spend fetched successfully', data);
});

export const frontendUpdate: RequestHandler = catchAsync(async (req, res) => {
  await attachProofIfNeeded(req);
  const data = await PersonalSpendService.updatePersonalSpend(String(req.params.id), req.body, frontendActorFromRequest(req));
  sendSuccess(res, 'Personal spend updated successfully', data);
});

export const frontendRemove: RequestHandler = catchAsync(async (req, res) => {
  const data = await PersonalSpendService.deletePersonalSpend(String(req.params.id), frontendActorFromRequest(req));
  sendSuccess(res, 'Personal spend deleted successfully', data);
});

export const frontendCarryForward: RequestHandler = catchAsync(async (req, res) => {
  const data = await PersonalSpendService.markPersonalSpendCarriedForward(
    String(req.params.id),
    frontendActorFromRequest(req),
    req.body.note
  );
  sendSuccess(res, 'Personal spend carried forward successfully', data);
});

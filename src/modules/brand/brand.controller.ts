import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { uploadImageToS3 } from '../utils/s3';
import { catchAsync, sendSuccess } from '../utils';
import * as BrandService from './brand.service';

const normalizeBooleanField = (value: unknown) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
};

const ensureS3Configured = () => {
  if (!config.aws.region || !config.aws.accessKeyId || !config.aws.secretAccessKey || !config.aws.s3Bucket) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Image upload is not configured');
  }
};

export const create: RequestHandler = catchAsync(async (req, res) => {
  req.body.isActive = normalizeBooleanField(req.body.isActive);

  if (req.file) {
    ensureS3Configured();
    const uploaded = await uploadImageToS3(req.file);
    req.body.logo = uploaded.url;
  }

  const data = await BrandService.createBrand(req.body, String(req.user?._id));
  sendSuccess(res, 'Brand created successfully', data, 201);
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.listBrands(req.query as Record<string, any>);
  sendSuccess(res, 'Brands fetched successfully', data);
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.getBrandById(String(req.params.id));
  sendSuccess(res, 'Brand fetched successfully', data);
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  req.body.isActive = normalizeBooleanField(req.body.isActive);

  if (req.file) {
    ensureS3Configured();
    const uploaded = await uploadImageToS3(req.file);
    req.body.logo = uploaded.url;
  }

  const data = await BrandService.updateBrand(String(req.params.id), req.body, String(req.user?._id));
  sendSuccess(res, 'Brand updated successfully', data);
});

export const updateStatus: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.updateBrandStatus(String(req.params.id), Boolean(req.body.isActive), String(req.user?._id));
  sendSuccess(res, 'Brand status updated successfully', data);
});

export const bySupplier: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.listBrandsBySupplier(String(req.params.supplierId));
  sendSuccess(res, 'Brands fetched successfully', data);
});

export const options: RequestHandler = catchAsync(async (req, res) => {
  const data = await BrandService.listBrandOptions(req.query as Record<string, any>);
  sendSuccess(res, 'Brand options fetched successfully', data);
});

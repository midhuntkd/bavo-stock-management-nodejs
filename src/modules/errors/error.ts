import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import config from '../../configs/config';
import logger from '../logger/logger';
import ApiError from './ApiError';

export const errorConverter = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = error.message || 'Internal Server Error';

    if (err instanceof mongoose.Error.CastError || err instanceof mongoose.Error.ValidationError) {
      statusCode = httpStatus.BAD_REQUEST;
    }

    if (err?.name === 'MongoServerError' && err?.code === 11000) {
      statusCode = httpStatus.CONFLICT;
      const fields = Object.keys(err.keyValue || {});
      message = `Duplicate value for: ${fields.join(', ')}`;
    }

    error = new ApiError(statusCode, message, false);
  }

  next(error);
};

export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  let { statusCode, message } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal Server Error';
  }

  if (config.env === 'development') {
    logger.error(`${message}\n${err.stack || ''}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(typeof err.details !== 'undefined' ? { errors: err.details } : {}),
  });
};

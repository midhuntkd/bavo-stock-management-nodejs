import Joi from 'joi';
import validate from '../validate/validate.middleware';
import { IN_HAND_AMOUNT_COLLECT_TYPES } from './in-hand-amount.interface';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    userId: objectId.required(),
    collectDate: Joi.date().iso().required(),
    amount: Joi.number().min(0).required(),
    orderID: Joi.string().allow('', null),
    collectType: Joi.string()
      .valid(...IN_HAND_AMOUNT_COLLECT_TYPES)
      .required(),
    description: Joi.string().required(),
  }),
});

export const frontendCreate = validate({
  body: Joi.object({
    collectDate: Joi.date().iso().required(),
    amount: Joi.number().min(0).required(),
    orderID: Joi.string().allow('', null),
    collectType: Joi.string()
      .valid(...IN_HAND_AMOUNT_COLLECT_TYPES)
      .required(),
    description: Joi.string().required(),
  }),
});

export const update = validate({
  body: Joi.object({
    userId: objectId,
    collectDate: Joi.date().iso(),
    amount: Joi.number().min(0),
    orderID: Joi.string().allow('', null),
    collectType: Joi.string().valid(...IN_HAND_AMOUNT_COLLECT_TYPES),
    description: Joi.string(),
  }).min(1),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    userId: objectId,
    collectType: Joi.string().valid(...IN_HAND_AMOUNT_COLLECT_TYPES),
    search: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  }),
});

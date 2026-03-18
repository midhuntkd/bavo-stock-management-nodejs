import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();
const dateString = Joi.date().iso();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().allow('', null),
    type: Joi.string().valid('cash', 'bank', 'wallet', 'upi', 'other').required(),
    bankName: Joi.string().allow('', null),
    accountNumber: Joi.string().allow('', null),
    ifsc: Joi.string().allow('', null),
    branch: Joi.string().allow('', null),
    openingBalance: Joi.number().min(0).default(0),
    currentBalance: Joi.number().min(0),
    currency: Joi.string().default('INR'),
    description: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    type: Joi.string().valid('cash', 'bank', 'wallet', 'upi', 'other'),
    isActive: Joi.string().valid('true', 'false'),
    status: Joi.string().valid('active', 'inactive', 'all'),
    search: Joi.string(),
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    code: Joi.string().allow('', null),
    type: Joi.string().valid('cash', 'bank', 'wallet', 'upi', 'other'),
    bankName: Joi.string().allow('', null),
    accountNumber: Joi.string().allow('', null),
    ifsc: Joi.string().allow('', null),
    branch: Joi.string().allow('', null),
    openingBalance: Joi.number().min(0),
    currency: Joi.string(),
    description: Joi.string().allow('', null),
  }).min(1),
});

export const status = validate({
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
});

export const statement = validate({
  query: Joi.object({
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
    startDate: dateString,
    endDate: dateString,
    isActive: Joi.string().valid('true', 'false'),
    type: Joi.string().valid('cash', 'bank', 'wallet', 'upi', 'other'),
  }),
});
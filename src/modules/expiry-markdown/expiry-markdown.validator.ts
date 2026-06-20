import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

const tierSchema = Joi.object({
  daysBeforeExpiry: Joi.number().integer().min(1).required(),
  discountPercent: Joi.number().min(0.01).max(100).required(),
});

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const createRule = validate({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    warehouseId: objectId.allow(null, ''),
    categoryId: objectId.allow(null, ''),
    tiers: Joi.array().items(tierSchema).min(1).required(),
    isActive: Joi.boolean(),
  }),
});

export const updateRule = validate({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    warehouseId: objectId.allow(null, ''),
    categoryId: objectId.allow(null, ''),
    tiers: Joi.array().items(tierSchema).min(1),
    isActive: Joi.boolean(),
  }),
});

export const listRules = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    warehouseId: objectId,
    isActive: Joi.string().valid('true', 'false'),
  }),
});

export const runJob = validate({
  body: Joi.object({
    warehouseId: objectId.allow(null, ''),
    dryRun: Joi.boolean().default(false),
  }),
});

export const listLogs = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    batchId: objectId,
    productId: objectId,
    warehouseId: objectId,
  }),
});

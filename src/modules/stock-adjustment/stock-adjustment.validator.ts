import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();
const itemSchema = Joi.object({
  stockId: objectId.required(),
  batchId: objectId,
  expectedQty: Joi.number().required(),
  actualQty: Joi.number().required(),
  differenceQty: Joi.number().required(),
  note: Joi.string().allow('', null),
});

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    warehouseId: objectId.required(),
    reason: Joi.string().valid('damage', 'expiry', 'manualCorrection', 'theft', 'countMismatch').required(),
    note: Joi.string().allow('', null),
    items: Joi.array().items(itemSchema).min(1).required(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    warehouseId: objectId,
    reason: Joi.string().valid('damage', 'expiry', 'manualCorrection', 'theft', 'countMismatch'),
  }),
});

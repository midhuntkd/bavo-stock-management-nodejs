import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    productId: objectId,
    warehouseId: objectId,
    stockId: objectId,
    expiryBefore: Joi.date().iso(),
    status: Joi.string().valid('active', 'expired', 'damaged', 'blocked'),
  }),
});

export const markStatus = validate({
  body: Joi.object({
    status: Joi.string().valid('active', 'expired', 'damaged', 'blocked').required(),
  }),
});


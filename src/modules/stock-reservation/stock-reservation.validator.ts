import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const reserve = validate({
  body: Joi.object({
    warehouseId: objectId.required(),
    stockId: objectId.required(),
    batchId: objectId,
    productId: objectId.required(),
    orderId: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    expiresAt: Joi.date().iso(),
    note: Joi.string().allow('', null),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    warehouseId: objectId,
    orderId: Joi.string(),
    status: Joi.string().valid('reserved', 'released', 'consumed', 'expired'),
  }),
});

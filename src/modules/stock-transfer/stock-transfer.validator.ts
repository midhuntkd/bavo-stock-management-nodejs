import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();
const itemSchema = Joi.object({
  productId: objectId.required(),
  batchId: objectId,
  quantity: Joi.number().positive().required(),
  fromLocationId: objectId,
  toLocationId: objectId,
});

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    fromWarehouseId: objectId.required(),
    toWarehouseId: objectId.required(),
    transferDate: Joi.date().iso().required(),
    note: Joi.string().allow('', null),
    items: Joi.array().items(itemSchema).min(1).required(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid('draft', 'inTransit', 'received', 'cancelled'),
    fromWarehouseId: objectId,
    toWarehouseId: objectId,
  }),
});

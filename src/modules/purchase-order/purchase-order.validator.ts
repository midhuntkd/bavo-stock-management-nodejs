import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

const itemSchema = Joi.object({
  productId: objectId.required(),
  orderedQty: Joi.number().positive().required(),
  unitCost: Joi.number().min(0).required(),
  gstRate: Joi.number().min(0).required(),
  discountAmount: Joi.number().min(0).default(0),
  lineTotal: Joi.number().min(0).required(),
});

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    warehouseId: objectId.required(),
    supplierId: objectId.required(),
    orderDate: Joi.date().iso().required(),
    expectedDate: Joi.date().iso(),
    subtotal: Joi.number().min(0).required(),
    taxAmount: Joi.number().min(0).required(),
    discountAmount: Joi.number().min(0).required(),
    totalAmount: Joi.number().min(0).required(),
    note: Joi.string().allow('', null),
    items: Joi.array().items(itemSchema).min(1).required(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid('draft', 'approved', 'partiallyReceived', 'received', 'cancelled'),
    warehouseId: objectId,
    supplierId: objectId,
  }),
});

export const updateDraft = validate({
  body: Joi.object({
    expectedDate: Joi.date().iso(),
    subtotal: Joi.number().min(0),
    taxAmount: Joi.number().min(0),
    discountAmount: Joi.number().min(0),
    totalAmount: Joi.number().min(0),
    note: Joi.string().allow('', null),
    items: Joi.array().items(itemSchema).min(1),
  }).min(1),
});

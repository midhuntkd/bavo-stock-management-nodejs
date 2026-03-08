import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

const movementBody = {
  quantity: Joi.number().positive().required(),
  referenceType: Joi.string().allow('', null),
  referenceId: Joi.string().allow('', null),
  note: Joi.string().allow('', null),
};

export const create = validate({
  body: Joi.object({
    productName: Joi.string().required(),
    sku: Joi.string().required(),
    warehouseId: objectId.required(),
    quantity: Joi.number().min(0).required(),
    reservedQuantity: Joi.number().min(0),
    minimumStockLevel: Joi.number().min(0),
    unit: Joi.string().required(),
    status: Joi.string().valid('active', 'inactive'),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string(),
    warehouseId: objectId,
    status: Joi.string().valid('active', 'inactive'),
    lowStock: Joi.string().valid('true', 'false'),
  }),
});

export const idParam = validate({
  params: Joi.object({ id: objectId.required() }),
});

export const update = validate({
  body: Joi.object({
    productName: Joi.string(),
    unit: Joi.string(),
    minimumStockLevel: Joi.number().min(0),
    status: Joi.string().valid('active', 'inactive'),
  }).min(1),
});

export const stockIn = validate({ body: Joi.object(movementBody) });
export const stockOut = validate({ body: Joi.object(movementBody) });
export const reserve = validate({ body: Joi.object(movementBody) });
export const release = validate({ body: Joi.object(movementBody) });

export const adjust = validate({
  body: Joi.object({
    quantity: Joi.number().required(),
    referenceType: Joi.string().allow('', null),
    referenceId: Joi.string().allow('', null),
    note: Joi.string().allow('', null),
  }),
});

export const transfer = validate({
  body: Joi.object({
    sourceStockId: objectId.required(),
    targetWarehouseId: objectId.required(),
    quantity: Joi.number().positive().required(),
    referenceType: Joi.string().allow('', null),
    referenceId: Joi.string().allow('', null),
    note: Joi.string().allow('', null),
  }),
});

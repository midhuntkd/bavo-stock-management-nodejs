import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

const itemSchema = Joi.object({
  productId: objectId.required(),
  batchNo: Joi.string().allow('', null),
  expiryDate: Joi.date().iso(),
  receivedQty: Joi.number().positive().required(),
  freeQty: Joi.number().min(0).default(0),
  unitCost: Joi.number().min(0).required(),
  gstRate: Joi.number().min(0).required(),
  mrp: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).required(),
  lineTotal: Joi.number().min(0).required(),
  locationId: objectId,
});

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    purchaseOrderId: objectId.required(),
    warehouseId: objectId.required(),
    supplierId: objectId.required(),
    invoiceNo: Joi.string().allow('', null),
    invoiceDate: Joi.date().iso(),
    note: Joi.string().allow('', null),
    items: Joi.array().items(itemSchema).min(1).required(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid('draft', 'received', 'cancelled'),
    warehouseId: objectId,
  }),
});

import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();
const unit = Joi.string().valid('g', 'kg', 'ml', 'l', 'pc', 'pack', 'box');

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    sku: Joi.string().required(),
    barcode: Joi.string().allow('', null),
    categoryId: Joi.string().allow('', null),
    manufacturerId: Joi.string().allow('', null),
    brandId: objectId.allow('', null),
    unit: unit.required(),
    packSize: Joi.string().allow('', null),
    hsnCode: Joi.string().allow('', null),
    gstRate: Joi.number().min(0).required(),
    mrp: Joi.number().min(0).required(),
    salePrice: Joi.number().min(0).required(),
    costPrice: Joi.number().min(0).required(),
    trackInventory: Joi.boolean(),
    batchEnabled: Joi.boolean(),
    expiryEnabled: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    search: Joi.string(),
    isActive: Joi.string().valid('true', 'false'),
    batchEnabled: Joi.string().valid('true', 'false'),
    expiryEnabled: Joi.string().valid('true', 'false'),
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    sku: Joi.string(),
    barcode: Joi.string().allow('', null),
    categoryId: Joi.string().allow('', null),
    manufacturerId: Joi.string().allow('', null),
    brandId: objectId.allow('', null),
    unit,
    packSize: Joi.string().allow('', null),
    hsnCode: Joi.string().allow('', null),
    gstRate: Joi.number().min(0),
    mrp: Joi.number().min(0),
    salePrice: Joi.number().min(0),
    costPrice: Joi.number().min(0),
    trackInventory: Joi.boolean(),
    batchEnabled: Joi.boolean(),
    expiryEnabled: Joi.boolean(),
    isActive: Joi.boolean(),
  }).min(1),
});


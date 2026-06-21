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
    categoryId: objectId.allow('', null),
    category: objectId.allow('', null),
    manufacturer: Joi.string().allow('', null),
    brandId: objectId.allow('', null),
    unit: unit.required(),
    unitMeasurement: Joi.string().allow('', null),
    unitValue: Joi.number().min(0),
    availableQuantity: Joi.number().min(0),
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
    productId: objectId,
    search: Joi.string(),
    brandId: objectId,
    categoryId: objectId,
    category: objectId,
    barcode: Joi.string(),
    isActive: Joi.string().valid('true', 'false'),
    status: Joi.string().valid('active', 'inactive'),
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
    categoryId: objectId.allow('', null),
    category: objectId.allow('', null),
    manufacturer: Joi.string().allow('', null),
    brandId: objectId.allow('', null),
    unit,
    unitMeasurement: Joi.string().allow('', null),
    unitValue: Joi.number().min(0),
    availableQuantity: Joi.number().min(0),
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

export const syncFromBavoAdmin = validate({
  body: Joi.object({}).unknown(false),
});


import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();
const warehouseType = Joi.string().valid('darkStore', 'mainWarehouse', 'miniWarehouse', 'store');

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    type: warehouseType.required(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().allow('', null),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    pincode: Joi.string().required(),
    contactName: Joi.string().allow('', null),
    contactPhone: Joi.string().allow('', null),
    serviceArea: Joi.object({
      type: Joi.string().valid('Polygon').required(),
      coordinates: Joi.array().items(Joi.array().items(Joi.array().items(Joi.number()).length(2))).required(),
    }).optional(),
    openingTime: Joi.string().allow('', null),
    closingTime: Joi.string().allow('', null),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    search: Joi.string(),
    type: warehouseType,
    isActive: Joi.string().valid('true', 'false'),
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    type: warehouseType,
    addressLine1: Joi.string(),
    addressLine2: Joi.string().allow('', null),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    pincode: Joi.string(),
    contactName: Joi.string().allow('', null),
    contactPhone: Joi.string().allow('', null),
    serviceArea: Joi.object({
      type: Joi.string().valid('Polygon').required(),
      coordinates: Joi.array().items(Joi.array().items(Joi.array().items(Joi.number()).length(2))).required(),
    }),
    openingTime: Joi.string().allow('', null),
    closingTime: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }).min(1),
});

export const setActiveState = validate({
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
});


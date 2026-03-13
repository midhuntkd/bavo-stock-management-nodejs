import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({
  params: Joi.object({ id: objectId.required() }),
});

export const supplierIdParam = validate({
  params: Joi.object({ supplierId: objectId.required() }),
});

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().allow('', null),
    slug: Joi.string().allow('', null),
    supplierId: objectId.required(),
    manufacturer: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    logo: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string(),
    supplierId: objectId,
    manufacturer: Joi.string(),
    isActive: Joi.string().valid('true', 'false'),
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    code: Joi.string().allow('', null),
    slug: Joi.string().allow('', null),
    supplierId: objectId,
    manufacturer: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    logo: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }).min(1),
});

export const status = validate({
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
});

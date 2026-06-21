import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const detail = validate({
  params: Joi.object({ id: objectId.required() }),
  query: Joi.object({
    includeBrands: Joi.string().valid('true', 'false'),
  }),
});

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    contactPerson: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    gstNo: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    search: Joi.string(),
    isActive: Joi.string().valid('true', 'false'),
  }),
});

export const options = validate({
  query: Joi.object({
    search: Joi.string(),
    isActive: Joi.string().valid('true', 'false'),
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    contactPerson: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    gstNo: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }).min(1),
});


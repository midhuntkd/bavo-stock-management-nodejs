import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    pincode: Joi.string().required(),
    contactName: Joi.string().allow('', null),
    contactPhone: Joi.string().allow('', null),
    status: Joi.string().valid('active', 'inactive'),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string(),
    status: Joi.string().valid('active', 'inactive'),
  }),
});

export const idParam = validate({
  params: Joi.object({ id: objectId.required() }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    pincode: Joi.string(),
    contactName: Joi.string().allow('', null),
    contactPhone: Joi.string().allow('', null),
    status: Joi.string().valid('active', 'inactive'),
  }).min(1),
});

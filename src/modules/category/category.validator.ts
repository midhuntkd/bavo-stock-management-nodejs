import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();
const status = Joi.string().valid('Active', 'Inactive', 'Delete');

export const idParam = validate({
  params: Joi.object({ id: objectId.required() }),
});

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    pageKey: Joi.string().allow('', null),
    slug: Joi.string().allow('', null),
    sortOrder: Joi.number().integer(),
    status,
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    search: Joi.string(),
    pageKey: Joi.string(),
    status,
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    description: Joi.string().allow('', null),
    pageKey: Joi.string().allow('', null),
    slug: Joi.string().allow('', null),
    sortOrder: Joi.number().integer(),
    status,
  }).min(1),
});

export const updateStatus = validate({
  body: Joi.object({
    status: status.required(),
  }),
});

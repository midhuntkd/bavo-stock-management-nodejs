import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().allow('', null),
    roleCode: Joi.string().required(),
    permissions: Joi.array().items(Joi.string()).default([]),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    search: Joi.string(),
    roleCode: Joi.string(),
    isActive: Joi.string().valid('true', 'false'),
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string().allow('', null),
    roleCode: Joi.string(),
    permissions: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
  }).min(1),
});

export const resetPassword = validate({
  body: Joi.object({ password: Joi.string().min(8).required() }),
});

export const changePassword = validate({
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),
});


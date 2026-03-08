import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const createAdmin = validate({
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().allow('', null),
    permissions: Joi.array().items(Joi.string()).default([]),
  }),
});

export const listAdmins = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string(),
  }),
});

export const idParam = validate({
  params: Joi.object({ id: objectId.required() }),
});

export const updateAdmin = validate({
  body: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string().allow('', null),
    permissions: Joi.array().items(Joi.string()),
  }).min(1),
});

export const updateAdminStatus = validate({
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
});

export const resetAdminPassword = validate({
  body: Joi.object({
    password: Joi.string().min(8).required(),
  }),
});

export const updateAdminPermissions = validate({
  body: Joi.object({
    permissions: Joi.array().items(Joi.string()).required(),
  }),
});

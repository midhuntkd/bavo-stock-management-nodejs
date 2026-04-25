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
    permissionsCsv: Joi.string().allow('', null),
    isActive: Joi.boolean(),
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
    permissionsCsv: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }).min(1),
});

export const resetPassword = validate({
  body: Joi.object({ password: Joi.string().min(8).required() }),
});

export const resetPasswordByEmail = validate({
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
});

export const changePassword = validate({
  body: Joi.object({
    previousPassword: Joi.string(),
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8),
  }).custom((value, helpers) => {
    const hasPreviousFormat = typeof value.previousPassword === 'string' && !value.newPassword;
    const hasLegacyFormat = typeof value.newPassword === 'string' && !value.previousPassword;

    if (!hasPreviousFormat && !hasLegacyFormat) {
      return helpers.error('any.invalid');
    }

    return value;
  }, 'change password payload validation').messages({
    'any.invalid': 'Pass either previousPassword + currentPassword or currentPassword + newPassword',
  }),
});


import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    description: Joi.string().allow('', null),
    isSystem: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    description: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }).min(1),
});

export const setPermissions = validate({
  body: Joi.object({
    permissionCodes: Joi.array().items(Joi.string()).required(),
  }),
});

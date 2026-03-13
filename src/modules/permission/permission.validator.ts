import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({
  params: Joi.object({ id: objectId.required() }),
});

export const create = validate({
  body: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    module: Joi.string().required(),
    description: Joi.string().allow('', null),
  }),
});

export const update = validate({
  body: Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    module: Joi.string(),
    description: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }).min(1),
});

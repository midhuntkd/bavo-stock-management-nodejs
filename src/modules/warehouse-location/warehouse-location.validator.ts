import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    warehouseId: objectId.required(),
    zone: Joi.string().required(),
    rack: Joi.string().required(),
    shelf: Joi.string().required(),
    bin: Joi.string().required(),
    locationCode: Joi.string(),
    isPickable: Joi.boolean(),
    isActive: Joi.boolean(),
    priority: Joi.number().integer().min(0),
  }),
});

export const list = validate({
  query: Joi.object({
    warehouseId: objectId,
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    isActive: Joi.string().valid('true', 'false'),
  }),
});

export const update = validate({
  body: Joi.object({
    zone: Joi.string(),
    rack: Joi.string(),
    shelf: Joi.string(),
    bin: Joi.string(),
    locationCode: Joi.string(),
    isPickable: Joi.boolean(),
    isActive: Joi.boolean(),
    priority: Joi.number().integer().min(0),
  }).min(1),
});

export const setActiveState = validate({
  body: Joi.object({ isActive: Joi.boolean().required() }),
});

import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const monthlySummary = validate({
  query: Joi.object({
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).required(),
  }),
});

export const userSummary = validate({
  params: Joi.object({ userId: objectId.required() }),
  query: Joi.object({
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).required(),
  }),
});
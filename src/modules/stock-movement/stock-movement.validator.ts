import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    warehouseId: objectId,
    stockId: objectId,
    type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVE', 'RELEASE'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
});

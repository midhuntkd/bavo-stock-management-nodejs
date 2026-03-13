import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    warehouseId: objectId,
    productId: objectId,
    type: Joi.string().valid(
      'IN',
      'OUT',
      'ADJUSTMENT',
      'TRANSFER_IN',
      'TRANSFER_OUT',
      'RESERVE',
      'RELEASE',
      'RETURN_IN',
      'RETURN_OUT'
    ),
    movementType: Joi.string().valid(
      'purchase',
      'sale',
      'inHouseSale',
      'warehouseTransfer',
      'damage',
      'replace',
      'expiry',
      'return',
      'manualAdjustment'
    ),
    referenceType: Joi.string(),
    referenceId: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
});

import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    productId: objectId.required(),
    warehouseId: objectId.required(),
    locationId: objectId,
    quantity: Joi.number().min(0),
    reservedQuantity: Joi.number().min(0),
    damagedQuantity: Joi.number().min(0),
    minStockLevel: Joi.number().min(0),
    reorderLevel: Joi.number().min(0),
    maxStockLevel: Joi.number().min(0),
    lastPurchasePrice: Joi.number().min(0),
    weightedAverageCost: Joi.number().min(0),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    warehouseId: objectId,
    productId: objectId,
    locationId: objectId,
    status: Joi.string().valid('inStock', 'lowStock', 'outOfStock', 'inactive'),
    lowStock: Joi.string().valid('true', 'false'),
  }),
});


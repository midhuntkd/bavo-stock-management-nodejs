import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

const countSubmissionSchema = Joi.object({
  itemId: objectId.required(),
  countedQty: Joi.number().min(0).required(),
  note: Joi.string().allow('', null),
});

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const itemParam = validate({
  params: Joi.object({ id: objectId.required(), itemId: objectId.required() }),
});

export const create = validate({
  body: Joi.object({
    warehouseId: objectId.required(),
    locationId: objectId.allow(null, ''),
    categoryId: objectId.allow(null, ''),
    assignedTo: objectId.allow(null, ''),
    blindAudit: Joi.boolean().default(false),
    note: Joi.string().allow('', null),
    scheduledDate: Joi.date().iso(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    warehouseId: objectId,
    status: Joi.string().valid('draft', 'inProgress', 'submitted', 'reconciled'),
    assignedTo: objectId,
  }),
});

export const submit = validate({
  body: Joi.object({
    counts: Joi.array().items(countSubmissionSchema).min(1).required(),
  }),
});

export const updateItem = validate({
  body: Joi.object({
    countedQty: Joi.number().min(0).required(),
    note: Joi.string().allow('', null),
  }),
});

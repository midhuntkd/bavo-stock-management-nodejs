import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

const reimbursementBody = {
  personalSpendId: objectId.required(),
  accountId: objectId.allow(null),
  clearanceDate: Joi.date().iso().required(),
  clearedAmount: Joi.number().min(0).required(),
  actionType: Joi.string().valid('partialClear', 'fullClear', 'extend', 'carryForward').required(),
  paymentMethod: Joi.string().valid('cash', 'bank', 'upi', 'card', 'other').allow(null),
  note: Joi.string().allow('', null),
  proof: Joi.string().allow('', null),
};

export const create = validate({ body: Joi.object(reimbursementBody) });

export const update = validate({
  body: Joi.object({
    accountId: objectId.allow(null),
    clearanceDate: Joi.date().iso(),
    clearedAmount: Joi.number().min(0),
    actionType: Joi.string().valid('partialClear', 'fullClear', 'extend', 'carryForward'),
    paymentMethod: Joi.string().valid('cash', 'bank', 'upi', 'card', 'other').allow(null),
    note: Joi.string().allow('', null),
    proof: Joi.string().allow('', null),
  }).min(1),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    personalSpendId: objectId,
    userId: objectId,
    accountId: objectId,
    actionType: Joi.string().valid('partialClear', 'fullClear', 'extend', 'carryForward'),
    status: Joi.string().valid('active', 'cancelled', 'all'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  }),
});

export const monthlyHistory = validate({
  query: Joi.object({
    userId: objectId,
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  }),
});
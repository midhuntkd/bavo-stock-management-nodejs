import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({
  body: Joi.object({
    userId: objectId,
    spendDate: Joi.date().iso().required(),
    spendType: Joi.string().valid('fuel', 'travel', 'food', 'courier', 'officeExpense', 'billPayment', 'materialPurchase', 'maintenance', 'other').required(),
    amount: Joi.number().min(0).required(),
    paymentMode: Joi.string().valid('cash', 'bank', 'upi', 'card', 'other').required(),
    description: Joi.string().required(),
    vendorName: Joi.string().allow('', null),
    billNo: Joi.string().allow('', null),
    proof: Joi.string().allow('', null),
    note: Joi.string().allow('', null),
    companyAccountId: objectId.allow(null),
  }),
});

export const update = validate({
  body: Joi.object({
    userId: objectId,
    spendDate: Joi.date().iso(),
    spendType: Joi.string().valid('fuel', 'travel', 'food', 'courier', 'officeExpense', 'billPayment', 'materialPurchase', 'maintenance', 'other'),
    amount: Joi.number().min(0),
    paymentMode: Joi.string().valid('cash', 'bank', 'upi', 'card', 'other'),
    description: Joi.string(),
    vendorName: Joi.string().allow('', null),
    billNo: Joi.string().allow('', null),
    proof: Joi.string().allow('', null),
    note: Joi.string().allow('', null),
    companyAccountId: objectId.allow(null),
  }).min(1),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    userId: objectId,
    clearanceStatus: Joi.string().valid('pending', 'partiallyCleared', 'cleared', 'carriedForward'),
    spendType: Joi.string().valid('fuel', 'travel', 'food', 'courier', 'officeExpense', 'billPayment', 'materialPurchase', 'maintenance', 'other'),
    search: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  }),
});

export const carryForward = validate({
  body: Joi.object({
    note: Joi.string().allow('', null),
  }),
});
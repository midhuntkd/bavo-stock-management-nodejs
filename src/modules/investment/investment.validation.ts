import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

const investmentBody = {
  investorUserId: objectId.required(),
  investmentDate: Joi.date().iso().required(),
  investmentType: Joi.string().valid('cashDeposit', 'bankDeposit', 'billPayment', 'materialPurchase', 'expensePaid', 'assetPurchase', 'other').required(),
  paymentMode: Joi.string().valid('cash', 'bank', 'upi', 'card', 'cheque', 'other').required(),
  amount: Joi.number().min(0).required(),
  accountId: objectId.allow(null),
  affectsCompanyAccount: Joi.boolean().default(false),
  category: Joi.string().allow('', null),
  vendorName: Joi.string().allow('', null),
  billNo: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  note: Joi.string().allow('', null),
  proof: Joi.string().allow('', null),
  status: Joi.string().valid('draft', 'confirmed'),
};

export const create = validate({ body: Joi.object(investmentBody) });

export const update = validate({
  body: Joi.object({
    investorUserId: objectId,
    investmentDate: Joi.date().iso(),
    investmentType: Joi.string().valid('cashDeposit', 'bankDeposit', 'billPayment', 'materialPurchase', 'expensePaid', 'assetPurchase', 'other'),
    paymentMode: Joi.string().valid('cash', 'bank', 'upi', 'card', 'cheque', 'other'),
    amount: Joi.number().min(0),
    accountId: objectId.allow(null),
    affectsCompanyAccount: Joi.boolean(),
    category: Joi.string().allow('', null),
    vendorName: Joi.string().allow('', null),
    billNo: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    note: Joi.string().allow('', null),
    proof: Joi.string().allow('', null),
  }).min(1),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    investorUserId: objectId,
    accountId: objectId,
    status: Joi.string().valid('draft', 'confirmed', 'cancelled'),
    investmentType: Joi.string().valid('cashDeposit', 'bankDeposit', 'billPayment', 'materialPurchase', 'expensePaid', 'assetPurchase', 'other'),
    affectsCompanyAccount: Joi.string().valid('true', 'false'),
    search: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  }),
});

export const summary = validate({
  query: Joi.object({
    investorUserId: objectId,
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  }),
});
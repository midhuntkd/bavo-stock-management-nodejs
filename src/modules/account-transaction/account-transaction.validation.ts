import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

const bodyShape = {
  accountId: objectId.required(),
  transactionDate: Joi.date().iso().required(),
  type: Joi.string().valid('credit', 'debit', 'transfer_in', 'transfer_out').required(),
  sourceType: Joi.string().valid('investment', 'expense', 'sale', 'purchase', 'salary', 'bill', 'bankDeposit', 'bankWithdrawal', 'reimbursementClearance', 'manual', 'transfer').default('manual'),
  referenceType: Joi.string().allow('', null),
  referenceId: Joi.string().allow('', null),
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('cash', 'bank', 'upi', 'card', 'cheque', 'other').required(),
  description: Joi.string().allow('', null),
  note: Joi.string().allow('', null),
  proof: Joi.string().allow('', null),
};

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({ body: Joi.object(bodyShape) });

export const update = validate({
  body: Joi.object({
    accountId: objectId,
    transactionDate: Joi.date().iso(),
    type: Joi.string().valid('credit', 'debit', 'transfer_in', 'transfer_out'),
    referenceType: Joi.string().allow('', null),
    referenceId: Joi.string().allow('', null),
    amount: Joi.number().min(0),
    paymentMethod: Joi.string().valid('cash', 'bank', 'upi', 'card', 'cheque', 'other'),
    description: Joi.string().allow('', null),
    note: Joi.string().allow('', null),
    proof: Joi.string().allow('', null),
  }).min(1),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    accountId: objectId,
    type: Joi.string().valid('credit', 'debit', 'transfer_in', 'transfer_out', 'opening'),
    sourceType: Joi.string().valid('investment', 'expense', 'sale', 'purchase', 'salary', 'bill', 'bankDeposit', 'bankWithdrawal', 'reimbursementClearance', 'manual', 'transfer'),
    referenceType: Joi.string(),
    referenceId: Joi.string(),
    status: Joi.string().valid('active', 'cancelled', 'all'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  }),
});

export const cancel = validate({
  body: Joi.object({
    note: Joi.string().allow('', null),
  }),
});
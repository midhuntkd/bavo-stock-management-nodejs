import Joi from 'joi';
import validate from '../validate/validate.middleware';
import {
  COMPANY_EXPENSE_PAYMENT_METHODS,
  COMPANY_EXPENSE_STATUSES,
  COMPANY_EXPENSE_TYPES,
} from './company-expense.interface';

const objectId = Joi.string().length(24).hex();

const companyExpenseBody = {
  expenseDate: Joi.date().iso().required(),
  accountId: objectId.required(),
  expenseType: Joi.string()
    .valid(...COMPANY_EXPENSE_TYPES)
    .required(),
  amount: Joi.number().greater(0).required(),
  paymentMethod: Joi.string()
    .valid(...COMPANY_EXPENSE_PAYMENT_METHODS)
    .required(),
  vendorName: Joi.string().allow('', null),
  billNo: Joi.string().allow('', null),
  description: Joi.string().required(),
  note: Joi.string().allow('', null),
  proof: Joi.string().allow('', null),
  transferredByUserId: objectId.allow(null),
  approvedBy: objectId.allow(null),
  status: Joi.string().valid(...COMPANY_EXPENSE_STATUSES),
  affectsAccount: Joi.boolean().default(true),
  referenceType: Joi.string().allow('', null),
  referenceId: Joi.string().allow('', null),
};

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const create = validate({ body: Joi.object(companyExpenseBody) });

export const update = validate({
  body: Joi.object({
    expenseDate: Joi.date().iso(),
    accountId: objectId,
    expenseType: Joi.string().valid(...COMPANY_EXPENSE_TYPES),
    amount: Joi.number().greater(0),
    paymentMethod: Joi.string().valid(...COMPANY_EXPENSE_PAYMENT_METHODS),
    vendorName: Joi.string().allow('', null),
    billNo: Joi.string().allow('', null),
    description: Joi.string(),
    note: Joi.string().allow('', null),
    proof: Joi.string().allow('', null),
    transferredByUserId: objectId.allow(null),
    approvedBy: objectId.allow(null),
    status: Joi.string().valid(...COMPANY_EXPENSE_STATUSES),
    affectsAccount: Joi.boolean(),
    referenceType: Joi.string().allow('', null),
    referenceId: Joi.string().allow('', null),
  }).min(1),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    accountId: objectId,
    expenseType: Joi.string().valid(...COMPANY_EXPENSE_TYPES),
    status: Joi.string().valid(...COMPANY_EXPENSE_STATUSES, 'all'),
    transferredByUserId: objectId,
    createdBy: objectId,
    search: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  }),
});

export const status = validate({
  body: Joi.object({
    note: Joi.string().allow('', null),
  }),
});
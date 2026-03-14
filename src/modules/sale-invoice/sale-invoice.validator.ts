import Joi from 'joi';
import validate from '../validate/validate.middleware';

const objectId = Joi.string().length(24).hex();

const itemSchema = Joi.object({
  productId: objectId.required(),
  stockId: objectId,
  batchId: objectId,
  productName: Joi.string().required(),
  sku: Joi.string().allow('', null),
  unit: Joi.string().allow('', null),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().min(0).required(),
  gstRate: Joi.number().min(0).required(),
  gstAmount: Joi.number().min(0).required(),
  mrp: Joi.number().min(0).required(),
  discountAmount: Joi.number().min(0).default(0),
  lineTotal: Joi.number().min(0).required(),
});

export const idParam = validate({ params: Joi.object({ id: objectId.required() }) });

export const createDraft = validate({
  body: Joi.object({
    warehouseId: objectId.required(),
    invoiceType: Joi.string().valid('customerSale', 'inHouseSale').required(),
    customerName: Joi.string().allow('', null),
    customerPhone: Joi.string().allow('', null),
    inHouseUser: Joi.string().valid('midhun', 'shamshad', 'faseeh', 'staff'),
    staffId: Joi.string().allow('', null),
    subtotal: Joi.number().min(0).required(),
    gstAmount: Joi.number().min(0).required(),
    discountAmount: Joi.number().min(0).required(),
    grandTotal: Joi.number().min(0).required(),
    paymentMode: Joi.string().valid('cash', 'upi', 'card', 'wallet', 'credit').required(),
    paymentStatus: Joi.string().valid('pending', 'paid', 'partial', 'cancelled').required(),
    note: Joi.string().allow('', null),
    items: Joi.array().items(itemSchema).min(1).required(),
  }),
});

export const list = validate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(500),
    warehouseId: objectId,
    invoiceType: Joi.string().valid('customerSale', 'inHouseSale'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'partial', 'cancelled'),
    status: Joi.string().valid('draft', 'confirmed', 'cancelled'),
  }),
});


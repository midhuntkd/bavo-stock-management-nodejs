import httpStatus from 'http-status';
import { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { getPagination, generateRunningNumber } from '../utils';
import { PurchaseOrder, PurchaseOrderItem } from './purchase-order.model';

export const createPurchaseOrder = async (payload: any, actorId: string) => {
  const poNumber = await generateRunningNumber(config.numbering.poPrefix, 'purchase_order');

  const po = await PurchaseOrder.create({
    poNumber,
    warehouseId: new Types.ObjectId(payload.warehouseId),
    supplierId: new Types.ObjectId(payload.supplierId),
    status: 'draft',
    orderDate: new Date(payload.orderDate),
    expectedDate: payload.expectedDate ? new Date(payload.expectedDate) : undefined,
    subtotal: payload.subtotal,
    taxAmount: payload.taxAmount,
    discountAmount: payload.discountAmount,
    totalAmount: payload.totalAmount,
    note: payload.note,
    createdBy: new Types.ObjectId(actorId),
  });

  await PurchaseOrderItem.insertMany(
    payload.items.map((item: any) => ({
      purchaseOrderId: po._id,
      productId: new Types.ObjectId(item.productId),
      orderedQty: item.orderedQty,
      receivedQty: 0,
      unitCost: item.unitCost,
      gstRate: item.gstRate,
      discountAmount: item.discountAmount || 0,
      lineTotal: item.lineTotal,
    }))
  );

  return getPurchaseOrderById(String(po._id));
};

export const listPurchaseOrders = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.supplierId) filter.supplierId = query.supplierId;

  const [items, totalItems] = await Promise.all([
    PurchaseOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PurchaseOrder.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

export const getPurchaseOrderById = async (id: string) => {
  const po = await PurchaseOrder.findById(id);
  if (!po) throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
  const items = await PurchaseOrderItem.find({ purchaseOrderId: po._id });
  return { ...po.toObject(), items };
};

export const updateDraftPurchaseOrder = async (id: string, payload: any) => {
  const po = await PurchaseOrder.findById(id);
  if (!po) throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
  if (po.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft purchase orders can be updated');

  Object.assign(po, payload, {
    expectedDate: payload.expectedDate ? new Date(payload.expectedDate) : po.expectedDate,
  });
  await po.save();

  if (payload.items) {
    await PurchaseOrderItem.deleteMany({ purchaseOrderId: po._id });
    await PurchaseOrderItem.insertMany(
      payload.items.map((item: any) => ({
        purchaseOrderId: po._id,
        productId: new Types.ObjectId(item.productId),
        orderedQty: item.orderedQty,
        receivedQty: 0,
        unitCost: item.unitCost,
        gstRate: item.gstRate,
        discountAmount: item.discountAmount || 0,
        lineTotal: item.lineTotal,
      }))
    );
  }

  return getPurchaseOrderById(id);
};

export const approvePurchaseOrder = async (id: string, actorId: string) => {
  const po = await PurchaseOrder.findById(id);
  if (!po) throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
  if (po.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft purchase orders can be approved');

  po.status = 'approved';
  po.approvedBy = new Types.ObjectId(actorId);
  await po.save();

  return po;
};

export const cancelPurchaseOrder = async (id: string) => {
  const po = await PurchaseOrder.findById(id);
  if (!po) throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
  if (!['draft', 'approved'].includes(po.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Purchase order cannot be cancelled at current state');
  }
  po.status = 'cancelled';
  await po.save();
  return po;
};

export const addReceivedQtyForPOItem = async (purchaseOrderId: string, productId: string, qty: number, session?: any) => {
  const item = await PurchaseOrderItem.findOne({ purchaseOrderId, productId }).session(session || null);
  if (!item) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'PO item not found for received product');
  }
  item.receivedQty += qty;
  await item.save({ session });

  const poItems = await PurchaseOrderItem.find({ purchaseOrderId }).session(session || null);
  const allReceived = poItems.every((poItem) => poItem.receivedQty >= poItem.orderedQty);
  const anyReceived = poItems.some((poItem) => poItem.receivedQty > 0);

  const po = await PurchaseOrder.findById(purchaseOrderId).session(session || null);
  if (!po) throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
  po.status = allReceived ? 'received' : anyReceived ? 'partiallyReceived' : po.status;
  await po.save({ session });

  return item;
};

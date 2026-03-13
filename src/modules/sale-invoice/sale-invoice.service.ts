import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { Product } from '../product';
import { StockBatchService } from '../stock-batch';
import { createStockMovement } from '../stock-movement/stock-movement.service';
import { applyStockDelta, upsertStockSummary } from '../stock/stock.service';
import { generateRunningNumber, getPagination } from '../utils';
import { SaleInvoice, SaleInvoiceItem } from './sale-invoice.model';

export const createDraftInvoice = async (payload: any, actorId: string) => {
  const invoiceNo = await generateRunningNumber(config.numbering.invoicePrefix, 'sale_invoice');

  const invoice = await SaleInvoice.create({
    invoiceNo,
    warehouseId: new Types.ObjectId(payload.warehouseId),
    invoiceType: payload.invoiceType,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    inHouseUser: payload.inHouseUser,
    staffId: payload.staffId,
    subtotal: payload.subtotal,
    gstAmount: payload.gstAmount,
    discountAmount: payload.discountAmount,
    grandTotal: payload.grandTotal,
    paymentMode: payload.paymentMode,
    paymentStatus: payload.paymentStatus,
    status: 'draft',
    note: payload.note,
    createdBy: new Types.ObjectId(actorId),
  });

  await SaleInvoiceItem.insertMany(
    payload.items.map((item: any) => ({
      ...item,
      invoiceId: invoice._id,
      productId: new Types.ObjectId(item.productId),
      stockId: item.stockId ? new Types.ObjectId(item.stockId) : undefined,
      batchId: item.batchId ? new Types.ObjectId(item.batchId) : undefined,
    }))
  );

  return getInvoiceById(String(invoice._id));
};

export const confirmSaleInvoice = async (invoiceId: string, actorId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const invoice = await SaleInvoice.findById(invoiceId).session(session);
    if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, 'Sale invoice not found');
    if (invoice.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft invoice can be confirmed');

    const items = await SaleInvoiceItem.find({ invoiceId: invoice._id }).session(session);

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid product in invoice');

      if (item.batchId) {
        const batch = await StockBatchService.getBatchById(String(item.batchId));
        if (batch.availableQuantity < item.quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient quantity in selected batch');
        }
      }

      let stockId = item.stockId ? String(item.stockId) : undefined;
      if (!stockId) {
        const stock = await upsertStockSummary(
          { productId: String(item.productId), warehouseId: String(invoice.warehouseId) },
          {},
          session
        );
        if (!stock) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create stock summary');
        stockId = String(stock._id);
      }

      const updatedStock = await applyStockDelta(stockId, { quantityDelta: -item.quantity }, session);

      if (product.batchEnabled) {
        if (item.batchId) {
          await StockBatchService.applyBatchDelta(String(item.batchId), { quantityDelta: -item.quantity }, session);
        } else {
          const allocations = await StockBatchService.selectBatchesForIssue(stockId, item.quantity, session);
          for (const allocation of allocations) {
            await StockBatchService.applyBatchDelta(allocation.batchId, { quantityDelta: -allocation.quantity }, session);
          }
        }
      }

      item.stockId = new Types.ObjectId(stockId);
      await item.save({ session });

      await createStockMovement(
        {
          stockId,
          batchId: item.batchId ? String(item.batchId) : undefined,
          productId: String(item.productId),
          warehouseId: String(invoice.warehouseId),
          type: 'OUT',
          movementType: invoice.invoiceType === 'inHouseSale' ? 'inHouseSale' : 'sale',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.lineTotal,
          gstAmount: item.gstAmount,
          referenceType: 'saleInvoice',
          referenceId: invoice.invoiceNo,
          invoiceId: String(invoice._id),
          inHouseUser: invoice.inHouseUser,
          staffId: invoice.staffId,
          priceType: 'salePrice',
          note: invoice.note,
          balanceAfterMovement: updatedStock.availableQuantity,
          createdBy: actorId,
        },
        session
      );
    }

    invoice.status = 'confirmed';
    await invoice.save({ session });

    await session.commitTransaction();
    return getInvoiceById(invoiceId);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelInvoice = async (invoiceId: string, actorId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const invoice = await SaleInvoice.findById(invoiceId).session(session);
    if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, 'Sale invoice not found');
    if (invoice.status === 'cancelled') throw new ApiError(httpStatus.BAD_REQUEST, 'Invoice already cancelled');

    if (invoice.status === 'confirmed') {
      const items = await SaleInvoiceItem.find({ invoiceId: invoice._id }).session(session);

      for (const item of items) {
        if (!item.stockId) continue;
        const updatedStock = await applyStockDelta(String(item.stockId), { quantityDelta: item.quantity }, session);

        if (item.batchId) {
          await StockBatchService.applyBatchDelta(String(item.batchId), { quantityDelta: item.quantity }, session);
        }

        await createStockMovement(
          {
            stockId: String(item.stockId),
            batchId: item.batchId ? String(item.batchId) : undefined,
            productId: String(item.productId),
            warehouseId: String(invoice.warehouseId),
            type: 'RETURN_IN',
            movementType: 'return',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.lineTotal,
            gstAmount: item.gstAmount,
            referenceType: 'saleInvoiceCancel',
            referenceId: invoice.invoiceNo,
            invoiceId: String(invoice._id),
            priceType: 'salePrice',
            note: invoice.note,
            balanceAfterMovement: updatedStock.availableQuantity,
            createdBy: actorId,
          },
          session
        );
      }
    }

    invoice.status = 'cancelled';
    invoice.paymentStatus = 'cancelled';
    await invoice.save({ session });

    await session.commitTransaction();
    return invoice;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const listInvoices = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.invoiceType) filter.invoiceType = query.invoiceType;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.status) filter.status = query.status;

  const [items, totalItems] = await Promise.all([
    SaleInvoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SaleInvoice.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

export const getInvoiceById = async (id: string) => {
  const invoice = await SaleInvoice.findById(id);
  if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, 'Sale invoice not found');
  const items = await SaleInvoiceItem.find({ invoiceId: invoice._id });
  return { ...invoice.toObject(), items, printable: true };
};

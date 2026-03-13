import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { Product } from '../product';
import { StockBatchService } from '../stock-batch';
import { createStockMovement } from '../stock-movement/stock-movement.service';
import { applyStockDelta, upsertStockSummary } from '../stock/stock.service';
import { generateRunningNumber, getPagination } from '../utils';
import { StockTransfer, StockTransferItem } from './stock-transfer.model';

export const createTransfer = async (payload: any, actorId: string) => {
  if (payload.fromWarehouseId === payload.toWarehouseId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Source and destination warehouse cannot be same');
  }
  const transferNumber = await generateRunningNumber(config.numbering.transferPrefix, 'stock_transfer');

  const transfer = await StockTransfer.create({
    transferNumber,
    fromWarehouseId: new Types.ObjectId(payload.fromWarehouseId),
    toWarehouseId: new Types.ObjectId(payload.toWarehouseId),
    status: 'draft',
    transferDate: new Date(payload.transferDate),
    note: payload.note,
    createdBy: new Types.ObjectId(actorId),
  });

  await StockTransferItem.insertMany(
    payload.items.map((item: any) => ({
      transferId: transfer._id,
      productId: new Types.ObjectId(item.productId),
      batchId: item.batchId ? new Types.ObjectId(item.batchId) : undefined,
      quantity: item.quantity,
      fromLocationId: item.fromLocationId ? new Types.ObjectId(item.fromLocationId) : undefined,
      toLocationId: item.toLocationId ? new Types.ObjectId(item.toLocationId) : undefined,
    }))
  );

  return getTransferById(String(transfer._id));
};

export const executeStockTransfer = async (transferId: string, actorId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transfer = await StockTransfer.findById(transferId).session(session);
    if (!transfer) throw new ApiError(httpStatus.NOT_FOUND, 'Stock transfer not found');
    if (transfer.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft transfer can be dispatched');

    const items = await StockTransferItem.find({ transferId: transfer._id }).session(session);

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found for transfer item');

      const sourceStock = await upsertStockSummary(
        {
          productId: String(item.productId),
          warehouseId: String(transfer.fromWarehouseId),
          locationId: item.fromLocationId ? String(item.fromLocationId) : null,
        },
        {},
        session
      );
      if (!sourceStock) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to resolve source stock');

      if (sourceStock.availableQuantity < item.quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient source stock for transfer');
      }

      const updatedSource = await applyStockDelta(String(sourceStock._id), { quantityDelta: -item.quantity }, session);

      const targetStock = await upsertStockSummary(
        {
          productId: String(item.productId),
          warehouseId: String(transfer.toWarehouseId),
          locationId: item.toLocationId ? String(item.toLocationId) : null,
        },
        {},
        session
      );
      if (!targetStock) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to resolve target stock');

      const updatedTarget = await applyStockDelta(String(targetStock._id), { quantityDelta: item.quantity }, session);

      if (item.batchId) {
        const sourceBatch = await StockBatchService.applyBatchDelta(String(item.batchId), { quantityDelta: -item.quantity }, session);
        await StockBatchService.createOrUpdateBatch(
          {
            stockId: String(targetStock._id),
            productId: String(item.productId),
            warehouseId: String(transfer.toWarehouseId),
            locationId: item.toLocationId ? String(item.toLocationId) : undefined,
            batchNo: sourceBatch.batchNo,
            lotNo: sourceBatch.lotNo,
            mfgDate: sourceBatch.mfgDate,
            expiryDate: sourceBatch.expiryDate,
            quantity: item.quantity,
            purchasePrice: sourceBatch.purchasePrice,
            salePrice: sourceBatch.salePrice,
            mrp: sourceBatch.mrp,
          },
          session
        );
      }

      await createStockMovement(
        {
          stockId: String(sourceStock._id),
          batchId: item.batchId ? String(item.batchId) : undefined,
          productId: String(item.productId),
          warehouseId: String(transfer.fromWarehouseId),
          locationId: item.fromLocationId ? String(item.fromLocationId) : undefined,
          type: 'TRANSFER_OUT',
          movementType: 'warehouseTransfer',
          quantity: item.quantity,
          referenceType: 'stockTransfer',
          referenceId: transfer.transferNumber,
          note: transfer.note,
          balanceAfterMovement: updatedSource.availableQuantity,
          createdBy: actorId,
        },
        session
      );

      await createStockMovement(
        {
          stockId: String(targetStock._id),
          productId: String(item.productId),
          warehouseId: String(transfer.toWarehouseId),
          locationId: item.toLocationId ? String(item.toLocationId) : undefined,
          type: 'TRANSFER_IN',
          movementType: 'warehouseTransfer',
          quantity: item.quantity,
          referenceType: 'stockTransfer',
          referenceId: transfer.transferNumber,
          note: transfer.note,
          balanceAfterMovement: updatedTarget.availableQuantity,
          createdBy: actorId,
        },
        session
      );
    }

    transfer.status = 'inTransit';
    await transfer.save({ session });

    await session.commitTransaction();
    return getTransferById(transferId);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const receiveTransfer = async (transferId: string, actorId: string) => {
  const transfer = await StockTransfer.findById(transferId);
  if (!transfer) throw new ApiError(httpStatus.NOT_FOUND, 'Stock transfer not found');
  if (transfer.status !== 'inTransit') throw new ApiError(httpStatus.BAD_REQUEST, 'Only in-transit transfer can be received');
  transfer.status = 'received';
  transfer.receivedBy = new Types.ObjectId(actorId);
  await transfer.save();
  return transfer;
};

export const cancelTransfer = async (transferId: string) => {
  const transfer = await StockTransfer.findById(transferId);
  if (!transfer) throw new ApiError(httpStatus.NOT_FOUND, 'Stock transfer not found');
  if (transfer.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft transfer can be cancelled');
  transfer.status = 'cancelled';
  await transfer.save();
  return transfer;
};

export const listTransfers = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.fromWarehouseId) filter.fromWarehouseId = query.fromWarehouseId;
  if (query.toWarehouseId) filter.toWarehouseId = query.toWarehouseId;

  const [items, totalItems] = await Promise.all([
    StockTransfer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    StockTransfer.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

export const getTransferById = async (id: string) => {
  const transfer = await StockTransfer.findById(id);
  if (!transfer) throw new ApiError(httpStatus.NOT_FOUND, 'Stock transfer not found');
  const items = await StockTransferItem.find({ transferId: transfer._id });
  return { ...transfer.toObject(), items };
};

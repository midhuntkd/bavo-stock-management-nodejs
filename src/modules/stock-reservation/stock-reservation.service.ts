import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { StockBatchService } from '../stock-batch';
import { createStockMovement } from '../stock-movement/stock-movement.service';
import { applyStockDelta, getStockById } from '../stock/stock.service';
import { getPagination } from '../utils';
import StockReservation from './stock-reservation.model';

export const reserveStock = async (payload: {
  warehouseId: string;
  stockId: string;
  batchId?: string;
  productId: string;
  orderId: string;
  quantity: number;
  expiresAt?: string;
  note?: string;
  createdBy?: string;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const stock = await getStockById(payload.stockId);
    if (stock.availableQuantity < payload.quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient available stock to reserve');
    }

    const updatedStock = await applyStockDelta(
      payload.stockId,
      { reservedDelta: payload.quantity },
      session
    );

    if (payload.batchId) {
      const batch = await StockBatchService.getBatchById(payload.batchId);
      if (batch.availableQuantity < payload.quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient available stock in selected batch');
      }
      await StockBatchService.applyBatchDelta(payload.batchId, { reservedDelta: payload.quantity }, session);
    }

    const reservation = await StockReservation.create(
      [
        {
          warehouseId: new Types.ObjectId(payload.warehouseId),
          stockId: new Types.ObjectId(payload.stockId),
          batchId: payload.batchId ? new Types.ObjectId(payload.batchId) : undefined,
          productId: new Types.ObjectId(payload.productId),
          orderId: payload.orderId,
          quantity: payload.quantity,
          status: 'reserved',
          expiresAt: payload.expiresAt
            ? new Date(payload.expiresAt)
            : new Date(Date.now() + config.reservation.defaultExpiryMinutes * 60 * 1000),
          note: payload.note,
          createdBy: payload.createdBy ? new Types.ObjectId(payload.createdBy) : undefined,
        },
      ],
      { session }
    ).then((rows) => rows[0]);

    await createStockMovement(
      {
        stockId: payload.stockId,
        batchId: payload.batchId,
        productId: payload.productId,
        warehouseId: payload.warehouseId,
        type: 'RESERVE',
        movementType: 'manualAdjustment',
        quantity: payload.quantity,
        referenceType: 'reservation',
        referenceId: payload.orderId,
        note: payload.note,
        balanceAfterMovement: updatedStock.availableQuantity,
        createdBy: payload.createdBy,
      },
      session
    );

    await session.commitTransaction();
    return reservation;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const releaseStock = async (reservationId: string, actorId?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const reservation = await StockReservation.findById(reservationId).session(session);
    if (!reservation) throw new ApiError(httpStatus.NOT_FOUND, 'Reservation not found');
    if (reservation.status !== 'reserved') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Only reserved records can be released');
    }

    const updatedStock = await applyStockDelta(String(reservation.stockId), { reservedDelta: -reservation.quantity }, session);
    if (reservation.batchId) {
      await StockBatchService.applyBatchDelta(String(reservation.batchId), { reservedDelta: -reservation.quantity }, session);
    }

    reservation.status = 'released';
    await reservation.save({ session });

    await createStockMovement(
      {
        stockId: String(reservation.stockId),
        batchId: reservation.batchId ? String(reservation.batchId) : undefined,
        productId: String(reservation.productId),
        warehouseId: String(reservation.warehouseId),
        type: 'RELEASE',
        movementType: 'manualAdjustment',
        quantity: reservation.quantity,
        referenceType: 'reservation',
        referenceId: reservation.orderId,
        note: reservation.note,
        balanceAfterMovement: updatedStock.availableQuantity,
        createdBy: actorId,
      },
      session
    );

    await session.commitTransaction();
    return reservation;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const consumeReservedStock = async (reservationId: string, actorId?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const reservation = await StockReservation.findById(reservationId).session(session);
    if (!reservation) throw new ApiError(httpStatus.NOT_FOUND, 'Reservation not found');
    if (reservation.status !== 'reserved') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Only reserved records can be consumed');
    }

    const updatedStock = await applyStockDelta(
      String(reservation.stockId),
      { quantityDelta: -reservation.quantity, reservedDelta: -reservation.quantity },
      session
    );

    if (reservation.batchId) {
      await StockBatchService.applyBatchDelta(
        String(reservation.batchId),
        { quantityDelta: -reservation.quantity, reservedDelta: -reservation.quantity },
        session
      );
    }

    reservation.status = 'consumed';
    await reservation.save({ session });

    await createStockMovement(
      {
        stockId: String(reservation.stockId),
        batchId: reservation.batchId ? String(reservation.batchId) : undefined,
        productId: String(reservation.productId),
        warehouseId: String(reservation.warehouseId),
        type: 'OUT',
        movementType: 'sale',
        quantity: reservation.quantity,
        referenceType: 'reservation',
        referenceId: reservation.orderId,
        note: reservation.note,
        balanceAfterMovement: updatedStock.availableQuantity,
        createdBy: actorId,
      },
      session
    );

    await session.commitTransaction();
    return reservation;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const listReservations = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.orderId) filter.orderId = query.orderId;
  if (query.status) filter.status = query.status;

  const [items, totalItems] = await Promise.all([
    StockReservation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    StockReservation.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 },
  };
};

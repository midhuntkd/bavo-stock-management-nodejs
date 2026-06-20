import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';
import { StockAdjustment, StockAdjustmentItem } from '../stock-adjustment/stock-adjustment.model';
import Stock from '../stock/stock.model';
import { generateRunningNumber, getPagination } from '../utils';
import { CycleCount, CycleCountItem } from './cycle-count.model';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strips systemQty from items when the count is in blindAudit mode and
 * the status is still 'draft' or 'inProgress'. Once submitted/reconciled,
 * systemQty is always visible so variances can be reviewed.
 */
const sanitizeItems = (items: any[], blindAudit: boolean, status: string) => {
  const hideSystemQty = blindAudit && ['draft', 'inProgress'].includes(status);
  if (!hideSystemQty) return items;
  return items.map((item) => {
    const obj = typeof item.toObject === 'function' ? item.toObject() : { ...item };
    delete obj.systemQty;
    return obj;
  });
};

const buildResponse = (count: any, items: any[]) => ({
  ...( typeof count.toObject === 'function' ? count.toObject() : count),
  items: sanitizeItems(items, count.blindAudit, count.status),
});

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Creates a new cycle count and automatically populates items from current
 * stock records for the given warehouse (optionally filtered by location/category).
 */
export const createCycleCount = async (payload: any, actorId: string) => {
  const countNo = await generateRunningNumber('CC', 'cycle_count');

  // Build stock filter
  const stockFilter: any = { warehouseId: new Types.ObjectId(payload.warehouseId) };
  if (payload.locationId) stockFilter.locationId = new Types.ObjectId(payload.locationId);

  const stocks = await Stock.find(stockFilter).populate('productId', 'categoryId isActive');

  // Filter by category if specified
  const filteredStocks = payload.categoryId
    ? stocks.filter((s) => {
        const cat = (s.productId as any)?.categoryId;
        return cat && String(cat) === payload.categoryId;
      })
    : stocks;

  if (!filteredStocks.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No stock records found for the specified scope');
  }

  const count = await CycleCount.create({
    countNo,
    warehouseId: new Types.ObjectId(payload.warehouseId),
    locationId: payload.locationId ? new Types.ObjectId(payload.locationId) : null,
    categoryId: payload.categoryId ? new Types.ObjectId(payload.categoryId) : null,
    assignedTo: payload.assignedTo ? new Types.ObjectId(payload.assignedTo) : null,
    blindAudit: payload.blindAudit ?? false,
    note: payload.note,
    scheduledDate: payload.scheduledDate ? new Date(payload.scheduledDate) : undefined,
    status: 'draft',
    createdBy: new Types.ObjectId(actorId),
  });

  // Snapshot current system quantities into items
  const items = filteredStocks.map((stock) => ({
    cycleCountId: count._id,
    stockId: stock._id,
    productId: stock.productId,
    systemQty: stock.availableQuantity,
    countedQty: null,
    variance: null,
  }));

  await CycleCountItem.insertMany(items);

  return getCycleCountById(String(count._id));
};

export const listCycleCounts = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.status) filter.status = query.status;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;

  const [items, totalItems] = await Promise.all([
    CycleCount.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CycleCount.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

export const getCycleCountById = async (id: string) => {
  const count = await CycleCount.findById(id);
  if (!count) throw new ApiError(httpStatus.NOT_FOUND, 'Cycle count not found');
  const items = await CycleCountItem.find({ cycleCountId: count._id });
  return buildResponse(count, items);
};

// ─── Status Transitions ───────────────────────────────────────────────────────

/** Move draft → inProgress, recording startedAt timestamp */
export const startCycleCount = async (id: string) => {
  const count = await CycleCount.findById(id);
  if (!count) throw new ApiError(httpStatus.NOT_FOUND, 'Cycle count not found');
  if (count.status !== 'draft') throw new ApiError(httpStatus.BAD_REQUEST, 'Only draft counts can be started');

  count.status = 'inProgress';
  count.startedAt = new Date();
  await count.save();

  const items = await CycleCountItem.find({ cycleCountId: count._id });
  return buildResponse(count, items);
};

/**
 * Staff submit their counted quantities.
 * Accepts an array of { itemId, countedQty, note? }.
 * Computes variances and moves status → submitted.
 * Also auto-creates a draft StockAdjustment for items with non-zero variance.
 */
export const submitCycleCount = async (
  id: string,
  counts: Array<{ itemId: string; countedQty: number; note?: string }>,
  actorId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const count = await CycleCount.findById(id).session(session);
    if (!count) throw new ApiError(httpStatus.NOT_FOUND, 'Cycle count not found');
    if (!['draft', 'inProgress'].includes(count.status)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Count has already been submitted');
    }

    const items = await CycleCountItem.find({ cycleCountId: count._id }).session(session);
    const itemMap = new Map(items.map((i) => [String(i._id), i]));

    // Apply submitted counts
    for (const submission of counts) {
      const item = itemMap.get(submission.itemId);
      if (!item) continue;
      item.countedQty = submission.countedQty;
      item.variance = submission.countedQty - item.systemQty;
      if (submission.note) item.note = submission.note;
      await item.save({ session });
    }

    // Mark any un-submitted items as counted with the system quantity (no variance)
    for (const item of items) {
      if (item.countedQty === null || item.countedQty === undefined) {
        item.countedQty = item.systemQty;
        item.variance = 0;
        await item.save({ session });
      }
    }

    // Auto-create a draft StockAdjustment for items that have variance
    const varianceItems = items.filter((i) => i.variance !== 0);

    let adjustmentId: Types.ObjectId | null = null;
    if (varianceItems.length > 0) {
      const adjustmentNo = await generateRunningNumber(config.numbering.adjustmentPrefix, 'stock_adjustment');

      const adjustment = await StockAdjustment.create(
        [
          {
            adjustmentNo,
            warehouseId: count.warehouseId,
            reason: 'countMismatch',
            note: `Auto-generated from Cycle Count ${count.countNo}`,
            status: 'draft',
            createdBy: new Types.ObjectId(actorId),
          },
        ],
        { session }
      ).then((rows) => rows[0]);

      await StockAdjustmentItem.insertMany(
        varianceItems.map((item) => ({
          adjustmentId: adjustment._id,
          stockId: item.stockId,
          batchId: item.batchId ?? undefined,
          expectedQty: item.systemQty,
          actualQty: item.countedQty!,
          differenceQty: item.variance!,
          note: item.note,
        })),
        { session }
      );

      adjustmentId = adjustment._id as Types.ObjectId;
    }

    count.status = 'submitted';
    count.submittedAt = new Date();
    if (adjustmentId) count.adjustmentId = adjustmentId;
    await count.save({ session });

    await session.commitTransaction();

    // Re-fetch items outside session for clean response
    const finalItems = await CycleCountItem.find({ cycleCountId: count._id });
    return buildResponse(count, finalItems);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/** Manager marks count as reconciled after reviewing/applying the StockAdjustment */
export const reconcileCycleCount = async (id: string, actorId: string) => {
  const count = await CycleCount.findById(id);
  if (!count) throw new ApiError(httpStatus.NOT_FOUND, 'Cycle count not found');
  if (count.status !== 'submitted') throw new ApiError(httpStatus.BAD_REQUEST, 'Only submitted counts can be reconciled');

  count.status = 'reconciled';
  count.reconciledAt = new Date();
  count.reconciledBy = new Types.ObjectId(actorId);
  await count.save();

  const items = await CycleCountItem.find({ cycleCountId: count._id });
  return buildResponse(count, items);
};

/** Update counted quantities on individual items while count is inProgress */
export const updateItemCount = async (
  cycleCountId: string,
  itemId: string,
  countedQty: number,
  note?: string
) => {
  const count = await CycleCount.findById(cycleCountId);
  if (!count) throw new ApiError(httpStatus.NOT_FOUND, 'Cycle count not found');
  if (!['draft', 'inProgress'].includes(count.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update items on a submitted or reconciled count');
  }

  const item = await CycleCountItem.findOne({ _id: itemId, cycleCountId });
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Cycle count item not found');

  item.countedQty = countedQty;
  item.variance = countedQty - item.systemQty;
  if (note !== undefined) item.note = note;
  await item.save();

  return item;
};

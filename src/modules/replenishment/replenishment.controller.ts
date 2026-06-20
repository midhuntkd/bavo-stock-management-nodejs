import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as ReplenishmentService from './replenishment.service';

export const preview: RequestHandler = catchAsync(async (req, res) => {
  const warehouseId = req.query.warehouseId as string | undefined;
  const data = await ReplenishmentService.getReplenishmentPreview(warehouseId);
  sendSuccess(res, 'Replenishment preview generated', data);
});

export const run: RequestHandler = catchAsync(async (req, res) => {
  const { warehouseId } = req.body;
  const data = await ReplenishmentService.runReplenishment(warehouseId, String(req.user?._id));
  const poCount = data.purchaseOrdersCreated.length;
  sendSuccess(
    res,
    `Replenishment complete — ${poCount} draft PO${poCount !== 1 ? 's' : ''} created`,
    data
  );
});

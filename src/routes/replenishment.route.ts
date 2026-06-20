import { Router } from 'express';
import Joi from 'joi';
import { authenticate, authorizePermissions } from '../modules/auth';
import { ReplenishmentController } from '../modules/replenishment';
import validate from '../modules/validate/validate.middleware';

const router = Router();
const objectId = Joi.string().length(24).hex();

router.use(authenticate);

/**
 * @openapi
 * /replenishment/preview:
 *   get:
 *     tags: [Replenishment]
 *     summary: Preview what would be replenished (read-only, no POs created)
 *     description: |
 *       Returns all stock records below reorderLevel grouped by supplier,
 *       with velocity data and suggested order quantities.
 *       No purchase orders are created — use /replenishment/run to commit.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema: { type: string }
 *         description: Optional — scope preview to one warehouse
 *     responses:
 *       200:
 *         description: Preview data
 */
router.get(
  '/preview',
  authorizePermissions('purchase-order.view'),
  validate({ query: Joi.object({ warehouseId: objectId.allow('', null) }) }),
  ReplenishmentController.preview
);

/**
 * @openapi
 * /replenishment/run:
 *   post:
 *     tags: [Replenishment]
 *     summary: Run replenishment — creates draft POs per supplier for low-stock items
 *     description: |
 *       Scans stocks below reorderLevel, skips items with existing open POs,
 *       groups by last known supplier, and creates one draft PurchaseOrder per supplier.
 *       Items with no supplier are returned in `unassignedItems` for manual review.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *     responses:
 *       200:
 *         description: Replenishment result with created POs
 */
router.post(
  '/run',
  authorizePermissions('purchase-order.create'),
  validate({ body: Joi.object({ warehouseId: objectId.allow('', null) }) }),
  ReplenishmentController.run
);

export default router;

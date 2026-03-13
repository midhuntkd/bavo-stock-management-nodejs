import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { StockAdjustmentController, StockAdjustmentValidator } from '../modules/stock-adjustment';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'staff'));

/**
 * @openapi
 * /stock-adjustments:
 *   post:
 *     tags: [Stock Adjustment]
 *     summary: Create stock adjustment draft
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             reason: "countMismatch"
 *             note: "Cycle count"
 *             items:
 *               - stockId: "67d12f40f3f7fdb2e0b18a31"
 *                 expectedQty: 100
 *                 actualQty: 98
 *                 differenceQty: -2
 *                 note: "2 missing"
 *     responses:
 *       201:
 *         description: Adjustment created
 */
router.post('/', authorizePermissions('stock-adjustment.create'), StockAdjustmentValidator.create, StockAdjustmentController.create);

/**
 * @openapi
 * /stock-adjustments:
 *   get:
 *     tags: [Stock Adjustment]
 *     summary: List stock adjustments
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Adjustments fetched
 */
router.get('/', authorizePermissions('stock-adjustment.view'), StockAdjustmentValidator.list, StockAdjustmentController.list);

/**
 * @openapi
 * /stock-adjustments/{id}:
 *   get:
 *     tags: [Stock Adjustment]
 *     summary: Adjustment detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Adjustment fetched
 */
router.get('/:id', authorizePermissions('stock-adjustment.view'), StockAdjustmentValidator.idParam, StockAdjustmentController.getById);

/**
 * @openapi
 * /stock-adjustments/{id}/apply:
 *   patch:
 *     tags: [Stock Adjustment]
 *     summary: Apply adjustment and create movement
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Adjustment applied
 */
router.patch('/:id/apply', authorizePermissions('stock-adjustment.approve'), StockAdjustmentValidator.idParam, StockAdjustmentController.apply);

export default router;

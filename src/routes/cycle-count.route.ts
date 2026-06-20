import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { CycleCountController, CycleCountValidator } from '../modules/cycle-count';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /cycle-counts:
 *   post:
 *     tags: [Cycle Count]
 *     summary: Create a cycle count (auto-populates items from current stock)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             categoryId: "67d12f10f3f7fdb2e0b18a21"
 *             blindAudit: true
 *             scheduledDate: "2026-06-25T00:00:00.000Z"
 *             note: "Weekly dairy count"
 *     responses:
 *       201:
 *         description: Cycle count created
 */
router.post('/', authorizePermissions('stock-adjustment.create'), CycleCountValidator.create, CycleCountController.create);

/**
 * @openapi
 * /cycle-counts:
 *   get:
 *     tags: [Cycle Count]
 *     summary: List cycle counts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cycle counts fetched
 */
router.get('/', authorizePermissions('stock-adjustment.view'), CycleCountValidator.list, CycleCountController.list);

/**
 * @openapi
 * /cycle-counts/{id}:
 *   get:
 *     tags: [Cycle Count]
 *     summary: Get cycle count detail
 *     description: In blind audit mode, systemQty is hidden until the count is submitted.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cycle count fetched
 */
router.get('/:id', authorizePermissions('stock-adjustment.view'), CycleCountValidator.idParam, CycleCountController.getById);

/**
 * @openapi
 * /cycle-counts/{id}/start:
 *   patch:
 *     tags: [Cycle Count]
 *     summary: Start a draft cycle count (draft → inProgress)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Count started
 */
router.patch('/:id/start', authorizePermissions('stock-adjustment.create'), CycleCountValidator.idParam, CycleCountController.start);

/**
 * @openapi
 * /cycle-counts/{id}/items/{itemId}:
 *   patch:
 *     tags: [Cycle Count]
 *     summary: Update counted quantity for a single item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             countedQty: 47
 *             note: "Found behind shelf"
 *     responses:
 *       200:
 *         description: Item count updated
 */
router.patch('/:id/items/:itemId', authorizePermissions('stock-adjustment.create'), CycleCountValidator.itemParam, CycleCountValidator.updateItem, CycleCountController.updateItem);

/**
 * @openapi
 * /cycle-counts/{id}/submit:
 *   patch:
 *     tags: [Cycle Count]
 *     summary: Submit counted quantities — auto-creates draft StockAdjustment for variances
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             counts:
 *               - itemId: "67d12f40f3f7fdb2e0b18a31"
 *                 countedQty: 47
 *                 note: "2 units found damaged"
 *     responses:
 *       200:
 *         description: Count submitted, adjustment created if variances found
 */
router.patch('/:id/submit', authorizePermissions('stock-adjustment.create'), CycleCountValidator.idParam, CycleCountValidator.submit, CycleCountController.submit);

/**
 * @openapi
 * /cycle-counts/{id}/reconcile:
 *   patch:
 *     tags: [Cycle Count]
 *     summary: Mark count as reconciled (manager action after reviewing adjustment)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Count reconciled
 */
router.patch('/:id/reconcile', authorizePermissions('stock-adjustment.approve'), CycleCountValidator.idParam, CycleCountController.reconcile);

export default router;

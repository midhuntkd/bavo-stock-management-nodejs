import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { StockBatchController, StockBatchValidator } from '../modules/stock-batch';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /stock-batches:
 *   get:
 *     tags: [Stock Batch]
 *     summary: List stock batches
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema: { type: string }
 *       - in: query
 *         name: productId
 *         schema: { type: string }
 *       - in: query
 *         name: expiryBefore
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, expired, damaged, blocked] }
 *     responses:
 *       200:
 *         description: Batches fetched
 */
router.get('/', authorizePermissions('stock-batch.view'), StockBatchValidator.list, StockBatchController.list);

/**
 * @openapi
 * /stock-batches/{id}:
 *   get:
 *     tags: [Stock Batch]
 *     summary: Batch detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Batch fetched
 */
router.get('/:id', authorizePermissions('stock-batch.view'), StockBatchValidator.idParam, StockBatchController.getById);

/**
 * @openapi
 * /stock-batches/{id}/status:
 *   patch:
 *     tags: [Stock Batch]
 *     summary: Mark batch status
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
 *             status: "damaged"
 *     responses:
 *       200:
 *         description: Batch status updated
 */
router.patch('/:id/status', authorizePermissions('stock.update'), StockBatchValidator.idParam, StockBatchValidator.markStatus, StockBatchController.markStatus);

export default router;

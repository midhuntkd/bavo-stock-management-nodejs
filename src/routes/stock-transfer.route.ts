import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { StockTransferController, StockTransferValidator } from '../modules/stock-transfer';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /stock-transfers:
 *   post:
 *     tags: [Stock Transfer]
 *     summary: Create stock transfer draft
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             fromWarehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             toWarehouseId: "67d12f10f3f7fdb2e0b18a30"
 *             transferDate: "2026-03-12T12:00:00.000Z"
 *             note: "Rebalance"
 *             items:
 *               - productId: "67d12f40f3f7fdb2e0b18a31"
 *                 quantity: 20
 *     responses:
 *       201:
 *         description: Transfer created
 */
router.post('/', authorizePermissions('stock.transfer'), StockTransferValidator.create, StockTransferController.create);

/**
 * @openapi
 * /stock-transfers:
 *   get:
 *     tags: [Stock Transfer]
 *     summary: List stock transfers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Transfers fetched
 */
router.get('/', authorizePermissions('stock.view'), StockTransferValidator.list, StockTransferController.list);

/**
 * @openapi
 * /stock-transfers/{id}:
 *   get:
 *     tags: [Stock Transfer]
 *     summary: Transfer detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transfer fetched
 */
router.get('/:id', authorizePermissions('stock.view'), StockTransferValidator.idParam, StockTransferController.getById);

/**
 * @openapi
 * /stock-transfers/{id}/dispatch:
 *   patch:
 *     tags: [Stock Transfer]
 *     summary: Dispatch transfer (transfer out/in movements)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transfer dispatched
 */
router.patch('/:id/dispatch', authorizePermissions('stock.transfer'), StockTransferValidator.idParam, StockTransferController.dispatch);

/**
 * @openapi
 * /stock-transfers/{id}/receive:
 *   patch:
 *     tags: [Stock Transfer]
 *     summary: Mark transfer as received
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transfer received
 */
router.patch('/:id/receive', authorizePermissions('stock.transfer'), StockTransferValidator.idParam, StockTransferController.receive);

/**
 * @openapi
 * /stock-transfers/{id}/cancel:
 *   patch:
 *     tags: [Stock Transfer]
 *     summary: Cancel transfer draft
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transfer cancelled
 */
router.patch('/:id/cancel', authorizePermissions('stock.transfer'), StockTransferValidator.idParam, StockTransferController.cancel);

export default router;

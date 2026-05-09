import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { GoodsReceiptNoteController, GoodsReceiptNoteValidator } from '../modules/goods-receipt-note';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /grn:
 *   post:
 *     tags: [GRN]
 *     summary: Create GRN draft
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             purchaseOrderId: "67d30000f3f7fdb2e0b19022"
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             supplierId: "67d12f10f3f7fdb2e0b18a70"
 *             invoiceNo: "SUP-INV-5501"
 *             invoiceDate: "2026-03-12T09:00:00.000Z"
 *             note: "Received fresh stock"
 *             items:
 *               - productId: "67d12f40f3f7fdb2e0b18a31"
 *                 batchNo: "BATCH-202603"
 *                 expiryDate: "2026-06-30T00:00:00.000Z"
 *                 receivedQty: 50
 *                 freeQty: 2
 *                 unitCost: 20
 *                 gstRate: 5
 *                 mrp: 30
 *                 salePrice: 28
 *                 lineTotal: 1040
 *     responses:
 *       201:
 *         description: GRN created
 */
router.post('/', authorizePermissions('grn.create'), GoodsReceiptNoteValidator.create, GoodsReceiptNoteController.create);

/**
 * @openapi
 * /grn:
 *   get:
 *     tags: [GRN]
 *     summary: List GRN
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: GRN records fetched
 */
router.get('/', authorizePermissions('grn.view'), GoodsReceiptNoteValidator.list, GoodsReceiptNoteController.list);

/**
 * @openapi
 * /grn/{id}:
 *   get:
 *     tags: [GRN]
 *     summary: GRN detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: GRN fetched
 */
router.get('/:id', authorizePermissions('grn.view'), GoodsReceiptNoteValidator.idParam, GoodsReceiptNoteController.getById);

/**
 * @openapi
 * /grn/{id}/receive:
 *   patch:
 *     tags: [GRN]
 *     summary: Receive GRN and apply stock
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: GRN received and stock updated
 */
router.patch('/:id/receive', authorizePermissions('grn.update'), GoodsReceiptNoteValidator.idParam, GoodsReceiptNoteController.receive);

/**
 * @openapi
 * /grn/{id}/cancel:
 *   patch:
 *     tags: [GRN]
 *     summary: Cancel GRN draft
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: GRN cancelled
 */
router.patch('/:id/cancel', authorizePermissions('grn.update'), GoodsReceiptNoteValidator.idParam, GoodsReceiptNoteController.cancel);

export default router;

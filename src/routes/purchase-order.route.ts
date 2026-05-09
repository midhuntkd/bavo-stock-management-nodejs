import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { PurchaseOrderController, PurchaseOrderValidator } from '../modules/purchase-order';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /purchase-orders:
 *   post:
 *     tags: [Purchase Order]
 *     summary: Create purchase order
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             supplierId: "67d12f10f3f7fdb2e0b18a70"
 *             orderDate: "2026-03-12T09:00:00.000Z"
 *             expectedDate: "2026-03-14T09:00:00.000Z"
 *             subtotal: 1000
 *             taxAmount: 50
 *             discountAmount: 0
 *             totalAmount: 1050
 *             note: "Weekly replenishment"
 *             items:
 *               - productId: "67d12f40f3f7fdb2e0b18a31"
 *                 orderedQty: 50
 *                 unitCost: 20
 *                 gstRate: 5
 *                 discountAmount: 0
 *                 lineTotal: 1000
 *     responses:
 *       201:
 *         description: PO created
 */
router.post('/', authorizePermissions('purchase-order.create'), PurchaseOrderValidator.create, PurchaseOrderController.create);

/**
 * @openapi
 * /purchase-orders:
 *   get:
 *     tags: [Purchase Order]
 *     summary: List purchase orders
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: POs fetched
 */
router.get('/', authorizePermissions('purchase-order.view'), PurchaseOrderValidator.list, PurchaseOrderController.list);

/**
 * @openapi
 * /purchase-orders/{id}:
 *   get:
 *     tags: [Purchase Order]
 *     summary: PO detail with items
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PO fetched
 */
router.get('/:id', authorizePermissions('purchase-order.view'), PurchaseOrderValidator.idParam, PurchaseOrderController.getById);

/**
 * @openapi
 * /purchase-orders/{id}:
 *   patch:
 *     tags: [Purchase Order]
 *     summary: Update draft PO
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
 *             note: "Updated expected qty"
 *             expectedDate: "2026-03-15T09:00:00.000Z"
 *     responses:
 *       200:
 *         description: PO updated
 */
router.patch('/:id', authorizePermissions('purchase-order.update'), PurchaseOrderValidator.idParam, PurchaseOrderValidator.updateDraft, PurchaseOrderController.updateDraft);

/**
 * @openapi
 * /purchase-orders/{id}/approve:
 *   patch:
 *     tags: [Purchase Order]
 *     summary: Approve purchase order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PO approved
 */
router.patch('/:id/approve', authorizePermissions('purchase-order.approve'), PurchaseOrderValidator.idParam, PurchaseOrderController.approve);

/**
 * @openapi
 * /purchase-orders/{id}/cancel:
 *   patch:
 *     tags: [Purchase Order]
 *     summary: Cancel purchase order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PO cancelled
 */
router.patch('/:id/cancel', authorizePermissions('purchase-order.update'), PurchaseOrderValidator.idParam, PurchaseOrderController.cancel);

export default router;

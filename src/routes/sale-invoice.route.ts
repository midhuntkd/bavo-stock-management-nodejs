import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { SaleInvoiceController, SaleInvoiceValidator } from '../modules/sale-invoice';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'staff'));

/**
 * @openapi
 * /sale-invoices:
 *   post:
 *     tags: [Sale Invoice]
 *     summary: Create draft sale invoice
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             invoiceType: "inHouseSale"
 *             customerName: "Walk-in"
 *             inHouseUser: "staff"
 *             staffId: "ST-001"
 *             subtotal: 200
 *             gstAmount: 10
 *             discountAmount: 0
 *             grandTotal: 210
 *             paymentMode: "upi"
 *             paymentStatus: "paid"
 *             note: "Counter sale"
 *             items:
 *               - productId: "67d12f40f3f7fdb2e0b18a31"
 *                 productName: "Milk 500ml"
 *                 quantity: 5
 *                 unitPrice: 40
 *                 gstRate: 5
 *                 gstAmount: 10
 *                 mrp: 45
 *                 discountAmount: 0
 *                 lineTotal: 200
 *     responses:
 *       201:
 *         description: Draft invoice created
 */
router.post('/', authorizePermissions('sale-invoice.create'), SaleInvoiceValidator.createDraft, SaleInvoiceController.createDraft);

/**
 * @openapi
 * /sale-invoices:
 *   get:
 *     tags: [Sale Invoice]
 *     summary: List sale invoices
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Invoices fetched
 */
router.get('/', authorizePermissions('sale-invoice.view'), SaleInvoiceValidator.list, SaleInvoiceController.list);

/**
 * @openapi
 * /sale-invoices/{id}:
 *   get:
 *     tags: [Sale Invoice]
 *     summary: Invoice detail (printable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice fetched
 */
router.get('/:id', authorizePermissions('sale-invoice.view'), SaleInvoiceValidator.idParam, SaleInvoiceController.getById);

/**
 * @openapi
 * /sale-invoices/{id}/confirm:
 *   patch:
 *     tags: [Sale Invoice]
 *     summary: Confirm invoice and reduce stock
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice confirmed
 */
router.patch('/:id/confirm', authorizePermissions('sale-invoice.create'), SaleInvoiceValidator.idParam, SaleInvoiceController.confirm);

/**
 * @openapi
 * /sale-invoices/{id}/cancel:
 *   patch:
 *     tags: [Sale Invoice]
 *     summary: Cancel invoice and reverse stock if confirmed
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice cancelled
 */
router.patch('/:id/cancel', authorizePermissions('sale-invoice.cancel'), SaleInvoiceValidator.idParam, SaleInvoiceController.cancel);

export default router;

import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { StockMovementController, StockMovementValidator } from '../modules/stock-movement';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'staff'));

/**
 * @openapi
 * /stock-movements:
 *   get:
 *     tags: [Stock Movement]
 *     summary: List stock movement ledger
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema: { type: string }
 *       - in: query
 *         name: productId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, RESERVE, RELEASE, RETURN_IN, RETURN_OUT]
 *       - in: query
 *         name: movementType
 *         schema:
 *           type: string
 *           enum: [purchase, sale, inHouseSale, warehouseTransfer, damage, replace, expiry, return, manualAdjustment]
 *       - in: query
 *         name: referenceType
 *         schema: { type: string }
 *       - in: query
 *         name: referenceId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Movements fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock movements fetched successfully"
 *               data:
 *                 items:
 *                   - type: "OUT"
 *                     movementType: "sale"
 *                     quantity: 2
 *                     referenceType: "saleInvoice"
 *                     referenceId: "INV-20260312-000001"
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   totalItems: 1
 *                   totalPages: 1
 */
router.get('/', authorizePermissions('stock-movement.view'), StockMovementValidator.list, StockMovementController.list);

/**
 * @openapi
 * /stock-movements/{id}:
 *   get:
 *     tags: [Stock Movement]
 *     summary: Movement detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Movement fetched
 */
router.get('/:id', authorizePermissions('stock-movement.view'), StockMovementValidator.idParam, StockMovementController.getById);

export default router;

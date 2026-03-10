import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { StockMovementController, StockMovementValidator } from '../modules/stock-movement';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     StockMovementItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67d21000f3f7fdb2e0b19101"
 *         stockId:
 *           type: string
 *           example: "67d12f40f3f7fdb2e0b18a31"
 *         warehouseId:
 *           type: string
 *           example: "67d12f10f3f7fdb2e0b18a20"
 *         type:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, RESERVE, RELEASE]
 *           example: "IN"
 *         quantity:
 *           type: number
 *           example: 20
 *         referenceType:
 *           type: string
 *           nullable: true
 *           example: "purchase"
 *         referenceId:
 *           type: string
 *           nullable: true
 *           example: "PO-1001"
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Initial restock"
 *         createdBy:
 *           type: string
 *           example: "67d12ef0f3f7fdb2e0b18a11"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T10:00:00.000Z"
 *
 * /stock-movements:
 *   get:
 *     tags: [Stock Movements]
 *     summary: List stock movement logs with filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Records per page.
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *         description: Filter by warehouse id.
 *       - in: query
 *         name: stockId
 *         schema:
 *           type: string
 *         description: Filter by stock id.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, RESERVE, RELEASE]
 *         description: Filter by movement type.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include movements from this datetime (ISO 8601).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include movements up to this datetime (ISO 8601).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock movements fetched successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock movements fetched successfully"
 *               data:
 *                 - _id: "67d21000f3f7fdb2e0b19101"
 *                   stockId: "67d12f40f3f7fdb2e0b18a31"
 *                   warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *                   type: "IN"
 *                   quantity: 20
 *                   referenceType: "purchase"
 *                   referenceId: "PO-1001"
 *                   note: "Initial restock"
 *                   createdBy: "67d12ef0f3f7fdb2e0b18a11"
 *                   createdAt: "2026-03-10T10:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 20
 *                 total: 1
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('super_admin', 'admin'),
  authorizePermissions('stock-movement.view'),
  StockMovementValidator.list,
  StockMovementController.list
);

export default router;

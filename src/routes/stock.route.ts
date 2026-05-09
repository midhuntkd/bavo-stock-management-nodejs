import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { StockController, StockValidator } from '../modules/stock';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /stocks:
 *   post:
 *     tags: [Stock]
 *     summary: Create stock summary record
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             productId: "67d12f40f3f7fdb2e0b18a31"
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             quantity: 100
 *             reservedQuantity: 5
 *             damagedQuantity: 1
 *             minStockLevel: 10
 *             reorderLevel: 20
 *             maxStockLevel: 300
 *     responses:
 *       201:
 *         description: Stock record created
 */
router.post('/', authorizePermissions('stock.create'), StockValidator.create, StockController.create);

/**
 * @openapi
 * /stocks:
 *   get:
 *     tags: [Stock]
 *     summary: List stock summary
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema: { type: string }
 *       - in: query
 *         name: productId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [inStock, lowStock, outOfStock, inactive] }
 *       - in: query
 *         name: lowStock
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200:
 *         description: Stock records fetched
 */
router.get('/', authorizePermissions('stock.view'), StockValidator.list, StockController.list);

/**
 * @openapi
 * /stocks/low-stock/list:
 *   get:
 *     tags: [Stock]
 *     summary: Low stock items list
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Low stock list fetched
 */
router.get('/low-stock/list', authorizePermissions('stock.view'), StockController.lowStock);

/**
 * @openapi
 * /stocks/{id}:
 *   get:
 *     tags: [Stock]
 *     summary: Stock detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Stock detail fetched
 */
router.get('/:id', authorizePermissions('stock.view'), StockValidator.idParam, StockController.getById);

export default router;

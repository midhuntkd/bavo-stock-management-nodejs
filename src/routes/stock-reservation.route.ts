import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { StockReservationController, StockReservationValidator } from '../modules/stock-reservation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /stock-reservations:
 *   post:
 *     tags: [Stock Reservation]
 *     summary: Reserve stock
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             stockId: "67d12f40f3f7fdb2e0b18a31"
 *             productId: "67d12f40f3f7fdb2e0b18a31"
 *             orderId: "ORD-1001"
 *             quantity: 3
 *             note: "Hold for order"
 *     responses:
 *       201:
 *         description: Stock reserved
 */
router.post('/', authorizePermissions('stock.reserve'), StockReservationValidator.reserve, StockReservationController.reserve);

/**
 * @openapi
 * /stock-reservations:
 *   get:
 *     tags: [Stock Reservation]
 *     summary: List reservations
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [reserved, released, consumed, expired] }
 *     responses:
 *       200:
 *         description: Reservations fetched
 */
router.get('/', authorizePermissions('stock.view'), StockReservationValidator.list, StockReservationController.list);

/**
 * @openapi
 * /stock-reservations/{id}/release:
 *   patch:
 *     tags: [Stock Reservation]
 *     summary: Release reserved stock
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reservation released
 */
router.patch('/:id/release', authorizePermissions('stock.release'), StockReservationValidator.idParam, StockReservationController.release);

/**
 * @openapi
 * /stock-reservations/{id}/consume:
 *   patch:
 *     tags: [Stock Reservation]
 *     summary: Consume reservation (final stock out)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reservation consumed
 */
router.patch('/:id/consume', authorizePermissions('stock.out'), StockReservationValidator.idParam, StockReservationController.consume);

export default router;

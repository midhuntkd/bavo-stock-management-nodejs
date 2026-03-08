import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { StockMovementController, StockMovementValidator } from '../modules/stock-movement';

const router = Router();

/**
 * @openapi
 * /stock-movements:
 *   get:
 *     tags: [Stock Movements]
 *     summary: List stock movement logs with filters
 *     security:
 *       - bearerAuth: []
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

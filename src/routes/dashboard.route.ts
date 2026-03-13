import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { DashboardController } from '../modules/dashboard';

const router = Router();

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard summary stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Dashboard summary fetched successfully"
 *               data:
 *                 totalWarehouses: 3
 *                 totalActiveAdminUsers: 4
 *                 totalSuppliers: 12
 *                 totalProducts: 542
 *                 totalStockItems: 860
 *                 lowStockItemsCount: 18
 *                 totalPurchaseOrders: 120
 *                 totalGRN: 110
 *                 totalInvoices: 230
 *                 totalInHouseInvoices: 40
 *                 todayStockMovementsCount: 312
 */
router.get('/summary', authenticate, authorizeRoles('super_admin', 'admin', 'staff'), authorizePermissions('dashboard.view'), DashboardController.summary);

export default router;

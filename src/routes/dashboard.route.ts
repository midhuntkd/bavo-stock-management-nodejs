import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { DashboardController } from '../modules/dashboard';

const router = Router();

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get super admin dashboard summary
 *     description: Returns aggregate metrics used on dashboard cards.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Dashboard summary fetched successfully"
 *               data:
 *                 totalWarehouses: 4
 *                 totalAdmins: 6
 *                 totalStockItems: 128
 *                 lowStockItems: 12
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin + dashboard.view permission required).
 */
router.get('/summary', authenticate, authorizeRoles('super_admin'), authorizePermissions('dashboard.view'), DashboardController.summary);

export default router;

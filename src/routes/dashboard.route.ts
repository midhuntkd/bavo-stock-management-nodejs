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
 *     security:
 *       - bearerAuth: []
 */
router.get('/summary', authenticate, authorizeRoles('super_admin'), authorizePermissions('dashboard.view'), DashboardController.summary);

export default router;

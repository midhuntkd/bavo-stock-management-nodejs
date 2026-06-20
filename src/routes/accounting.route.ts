import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { AccountingDashboardController, AccountingDashboardValidator } from '../modules/accounting-dashboard';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /accounting/dashboard:
 *   get:
 *     tags: [Accounting]
 *     summary: Accounting dashboard summary
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', authorizePermissions('accounting.dashboard.view'), AccountingDashboardController.dashboard);

/**
 * @openapi
 * /accounting/monthly-summary:
 *   get:
 *     tags: [Accounting]
 *     summary: Monthly accounting summary
 *     security:
 *       - bearerAuth: []
 */
router.get('/monthly-summary', authorizePermissions('monthly-summary.view'), AccountingDashboardValidator.monthlySummary, AccountingDashboardController.monthlySummary);

/**
 * @openapi
 * /accounting/user-summary/{userId}:
 *   get:
 *     tags: [Accounting]
 *     summary: User accounting summary
 *     security:
 *       - bearerAuth: []
 */
router.get('/user-summary/:userId', authorizePermissions('monthly-summary.view'), AccountingDashboardValidator.userSummary, AccountingDashboardController.userSummary);

export default router;

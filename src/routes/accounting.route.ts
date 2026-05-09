import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { AccountingDashboardController, AccountingDashboardValidator } from '../modules/accounting-dashboard';

const router = Router();

router.use(authenticate);

router.get('/dashboard', authorizePermissions('accounting.dashboard.view'), AccountingDashboardController.dashboard);
router.get('/monthly-summary', authorizePermissions('monthly-summary.view'), AccountingDashboardValidator.monthlySummary, AccountingDashboardController.monthlySummary);
router.get('/user-summary/:userId', authorizePermissions('monthly-summary.view'), AccountingDashboardValidator.userSummary, AccountingDashboardController.userSummary);

export default router;

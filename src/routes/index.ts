import express, { Router } from 'express';
import authRoute from './auth.route';
import adminUserRoute from './admin-user.route';
import permissionRoute from './permission.route';
import warehouseRoute from './warehouse.route';
import stockRoute from './stock.route';
import stockMovementRoute from './stock-movement.route';
import dashboardRoute from './dashboard.route';
import roleRoute from './role.route';
import brandRoute from './brand.route';
import warehouseLocationRoute from './warehouse-location.route';
import supplierRoute from './supplier.route';
import productRoute from './product.route';
import stockBatchRoute from './stock-batch.route';
import stockReservationRoute from './stock-reservation.route';
import purchaseOrderRoute from './purchase-order.route';
import accountRoute from './account.route';
import accountTransactionRoute from './account-transaction.route';
import accountingRoute from './accounting.route';
import companyExpenseRoute from './company-expense.route';
import goodsReceiptNoteRoute from './goods-receipt-note.route';
import investmentRoute from './investment.route';
import personalSpendRoute from './personal-spend.route';
import reimbursementRoute from './reimbursement.route';
import stockTransferRoute from './stock-transfer.route';
import saleInvoiceRoute from './sale-invoice.route';
import stockAdjustmentRoute from './stock-adjustment.route';
import docsRoute from './swagger.route';
import healthRoute from './health.route';
import config from '../configs/config';

const router: Router = express.Router();

const defaultIRoute = [
  { path: '/auth', route: authRoute },
  { path: '/admin-users', route: adminUserRoute },
  { path: '/permissions', route: permissionRoute },
  { path: '/warehouses', route: warehouseRoute },
  { path: '/stocks', route: stockRoute },
  { path: '/stock-movements', route: stockMovementRoute },
  { path: '/dashboard', route: dashboardRoute },
  { path: '/roles', route: roleRoute },
  { path: '/brands', route: brandRoute },
  { path: '/warehouse-locations', route: warehouseLocationRoute },
  { path: '/suppliers', route: supplierRoute },
  { path: '/products', route: productRoute },
  { path: '/stock-batches', route: stockBatchRoute },
  { path: '/stock-reservations', route: stockReservationRoute },
  { path: '/purchase-orders', route: purchaseOrderRoute },
  { path: '/accounts', route: accountRoute },
  { path: '/account-transactions', route: accountTransactionRoute },
  { path: '/accounting', route: accountingRoute },
  { path: '/company-expenses', route: companyExpenseRoute },
  { path: '/grn', route: goodsReceiptNoteRoute },
  { path: '/investments', route: investmentRoute },
  { path: '/personal-spends', route: personalSpendRoute },
  { path: '/reimbursements', route: reimbursementRoute },
  { path: '/stock-transfers', route: stockTransferRoute },
  { path: '/sale-invoices', route: saleInvoiceRoute },
  { path: '/stock-adjustments', route: stockAdjustmentRoute },
  { path: '/health', route: healthRoute },
];

const devIRoute = [{ path: '/docs', route: docsRoute }];

defaultIRoute.forEach((route) => router.use(route.path, route.route));

if (config.docs.enabled) {
  devIRoute.forEach((route) => router.use(route.path, route.route));
}

export default router;

import express, { Router } from 'express';
import authRoute from './auth.route';
import adminUserRoute from './admin-user.route';
import permissionRoute from './permission.route';
import warehouseRoute from './warehouse.route';
import stockRoute from './stock.route';
import stockMovementRoute from './stock-movement.route';
import dashboardRoute from './dashboard.route';
import roleRoute from './role.route';
import docsRoute from './swagger.route';
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
];

const devIRoute = [{ path: '/docs', route: docsRoute }];

defaultIRoute.forEach((route) => router.use(route.path, route.route));

if (config.docs.enabled) {
  devIRoute.forEach((route) => router.use(route.path, route.route));
}

export default router;

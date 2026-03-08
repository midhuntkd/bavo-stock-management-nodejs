import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { WarehouseController, WarehouseValidator } from '../modules/warehouse';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin'));

/**
 * @openapi
 * /warehouses:
 *   post:
 *     tags: [Warehouses]
 *     summary: Create warehouse
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('warehouse.create'), WarehouseValidator.create, WarehouseController.create);
/**
 * @openapi
 * /warehouses:
 *   get:
 *     tags: [Warehouses]
 *     summary: List warehouses
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authorizePermissions('warehouse.view'), WarehouseValidator.list, WarehouseController.list);
/**
 * @openapi
 * /warehouses/{id}:
 *   get:
 *     tags: [Warehouses]
 *     summary: Get warehouse by id
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('warehouse.view'), WarehouseValidator.idParam, WarehouseController.getById);
/**
 * @openapi
 * /warehouses/{id}:
 *   patch:
 *     tags: [Warehouses]
 *     summary: Update warehouse
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', authorizePermissions('warehouse.update'), WarehouseValidator.idParam, WarehouseValidator.update, WarehouseController.update);
/**
 * @openapi
 * /warehouses/{id}/deactivate:
 *   patch:
 *     tags: [Warehouses]
 *     summary: Deactivate warehouse
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/deactivate', authorizePermissions('warehouse.delete'), WarehouseValidator.idParam, WarehouseController.deactivate);

export default router;

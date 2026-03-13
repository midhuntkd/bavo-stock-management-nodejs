import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { WarehouseLocationController, WarehouseLocationValidator } from '../modules/warehouse-location';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'staff'));

/**
 * @openapi
 * /warehouse-locations:
 *   post:
 *     tags: [Warehouse Locations]
 *     summary: Create warehouse location/bin
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             zone: "A"
 *             rack: "1"
 *             shelf: "2"
 *             bin: "3"
 *             locationCode: "A-R1-S2-B3"
 *             isPickable: true
 *             priority: 100
 *     responses:
 *       201:
 *         description: Location created
 */
router.post('/', authorizePermissions('warehouse-location.create'), WarehouseLocationValidator.create, WarehouseLocationController.create);

/**
 * @openapi
 * /warehouse-locations:
 *   get:
 *     tags: [Warehouse Locations]
 *     summary: List locations
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Locations fetched
 */
router.get('/', authorizePermissions('warehouse-location.view'), WarehouseLocationValidator.list, WarehouseLocationController.list);

/**
 * @openapi
 * /warehouse-locations/{id}:
 *   patch:
 *     tags: [Warehouse Locations]
 *     summary: Update location
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             priority: 200
 *             isPickable: false
 *     responses:
 *       200:
 *         description: Location updated
 */
router.patch('/:id', authorizePermissions('warehouse-location.update'), WarehouseLocationValidator.idParam, WarehouseLocationValidator.update, WarehouseLocationController.update);

/**
 * @openapi
 * /warehouse-locations/{id}/status:
 *   patch:
 *     tags: [Warehouse Locations]
 *     summary: Activate/deactivate location
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             isActive: false
 *     responses:
 *       200:
 *         description: Location status updated
 */
router.patch('/:id/status', authorizePermissions('warehouse-location.delete'), WarehouseLocationValidator.idParam, WarehouseLocationValidator.setActiveState, WarehouseLocationController.setActiveState);

export default router;

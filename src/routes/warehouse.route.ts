import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { WarehouseController, WarehouseValidator } from '../modules/warehouse';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'staff'));

/**
 * @openapi
 * /warehouses:
 *   post:
 *     tags: [Warehouses]
 *     summary: Create warehouse
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Main Dark Store"
 *             code: "WH-MAIN-01"
 *             type: "darkStore"
 *             addressLine1: "MG Road"
 *             city: "Kochi"
 *             state: "Kerala"
 *             country: "India"
 *             pincode: "682001"
 *             isActive: true
 *     responses:
 *       201:
 *         description: Warehouse created
 */
router.post('/', authorizePermissions('warehouse.create'), WarehouseValidator.create, WarehouseController.create);

/**
 * @openapi
 * /warehouses:
 *   get:
 *     tags: [Warehouses]
 *     summary: List warehouses
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [darkStore, mainWarehouse, miniWarehouse, store] }
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200:
 *         description: Warehouses fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Warehouses fetched successfully"
 *               data:
 *                 items: []
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   totalItems: 0
 *                   totalPages: 1
 */
router.get('/', authorizePermissions('warehouse.view'), WarehouseValidator.list, WarehouseController.list);

/**
 * @openapi
 * /warehouses/{id}:
 *   get:
 *     tags: [Warehouses]
 *     summary: Warehouse detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Warehouse fetched
 */
router.get('/:id', authorizePermissions('warehouse.view'), WarehouseValidator.idParam, WarehouseController.getById);

/**
 * @openapi
 * /warehouses/{id}:
 *   patch:
 *     tags: [Warehouses]
 *     summary: Update warehouse
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
 *             contactName: "Manager Name"
 *             openingTime: "08:00"
 *             closingTime: "22:00"
 *     responses:
 *       200:
 *         description: Warehouse updated
 */
router.patch('/:id', authorizePermissions('warehouse.update'), WarehouseValidator.idParam, WarehouseValidator.update, WarehouseController.update);

/**
 * @openapi
 * /warehouses/{id}/status:
 *   patch:
 *     tags: [Warehouses]
 *     summary: Activate/deactivate warehouse
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
 *         description: Warehouse status updated
 */
router.patch(
  '/:id/status',
  authorizePermissions('warehouse.delete'),
  WarehouseValidator.idParam,
  WarehouseValidator.setActiveState,
  WarehouseController.setActiveState
);

export default router;

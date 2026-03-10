import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { WarehouseController, WarehouseValidator } from '../modules/warehouse';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin'));

/**
 * @openapi
 * components:
 *   schemas:
 *     WarehouseItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67d12f10f3f7fdb2e0b18a20"
 *         name:
 *           type: string
 *           example: "Main Warehouse"
 *         code:
 *           type: string
 *           example: "WH001"
 *         address:
 *           type: string
 *           example: "Address Line"
 *         city:
 *           type: string
 *           example: "Kochi"
 *         state:
 *           type: string
 *           example: "Kerala"
 *         country:
 *           type: string
 *           example: "India"
 *         pincode:
 *           type: string
 *           example: "682001"
 *         contactName:
 *           type: string
 *           nullable: true
 *           example: "Store Manager"
 *         contactPhone:
 *           type: string
 *           nullable: true
 *           example: "9876543210"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           example: "active"
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T09:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T09:00:00.000Z"
 *
 * /warehouses:
 *   post:
 *     tags: [Warehouses]
 *     summary: Create warehouse
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, address, city, state, country, pincode]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Warehouse name.
 *                 example: "Main Warehouse"
 *               code:
 *                 type: string
 *                 description: Unique warehouse code.
 *                 example: "WH001"
 *               address:
 *                 type: string
 *                 description: Address line.
 *                 example: "Address Line"
 *               city:
 *                 type: string
 *                 description: City.
 *                 example: "Kochi"
 *               state:
 *                 type: string
 *                 description: State.
 *                 example: "Kerala"
 *               country:
 *                 type: string
 *                 description: Country.
 *                 example: "India"
 *               pincode:
 *                 type: string
 *                 description: Postal code.
 *                 example: "682001"
 *               contactName:
 *                 type: string
 *                 nullable: true
 *                 description: Contact person name.
 *                 example: "Store Manager"
 *               contactPhone:
 *                 type: string
 *                 nullable: true
 *                 description: Contact person phone.
 *                 example: "9876543210"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Warehouse status.
 *                 example: "active"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Warehouse created successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Warehouse created successfully"
 *               data:
 *                 _id: "67d12f10f3f7fdb2e0b18a20"
 *                 name: "Main Warehouse"
 *                 code: "WH001"
 *                 address: "Address Line"
 *                 city: "Kochi"
 *                 state: "Kerala"
 *                 country: "India"
 *                 pincode: "682001"
 *                 contactName: "Store Manager"
 *                 contactPhone: "9876543210"
 *                 status: "active"
 *                 isDeleted: false
 *       400:
 *         description: Validation failure or duplicate warehouse code.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 */
router.post('/', authorizePermissions('warehouse.create'), WarehouseValidator.create, WarehouseController.create);
/**
 * @openapi
 * /warehouses:
 *   get:
 *     tags: [Warehouses]
 *     summary: List warehouses
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Records per page.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name/code/city.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by warehouse status.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warehouses fetched successfully.
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 */
router.get('/', authorizePermissions('warehouse.view'), WarehouseValidator.list, WarehouseController.list);
/**
 * @openapi
 * /warehouses/{id}:
 *   get:
 *     tags: [Warehouses]
 *     summary: Get warehouse by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse id.
 *         example: "67d12f10f3f7fdb2e0b18a20"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warehouse fetched successfully.
 *       400:
 *         description: Invalid id format.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 *       404:
 *         description: Warehouse not found.
 */
router.get('/:id', authorizePermissions('warehouse.view'), WarehouseValidator.idParam, WarehouseController.getById);
/**
 * @openapi
 * /warehouses/{id}:
 *   patch:
 *     tags: [Warehouses]
 *     summary: Update warehouse
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated warehouse name.
 *               code:
 *                 type: string
 *                 description: Updated unique warehouse code.
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               pincode:
 *                 type: string
 *               contactName:
 *                 type: string
 *                 nullable: true
 *               contactPhone:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warehouse updated successfully.
 *       400:
 *         description: Validation failure.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 *       404:
 *         description: Warehouse not found.
 */
router.patch('/:id', authorizePermissions('warehouse.update'), WarehouseValidator.idParam, WarehouseValidator.update, WarehouseController.update);
/**
 * @openapi
 * /warehouses/{id}/deactivate:
 *   patch:
 *     tags: [Warehouses]
 *     summary: Deactivate warehouse
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse id.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warehouse deactivated successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Warehouse deactivated successfully"
 *               data:
 *                 _id: "67d12f10f3f7fdb2e0b18a20"
 *                 status: "inactive"
 *                 isDeleted: true
 *       400:
 *         description: Invalid id format.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 *       404:
 *         description: Warehouse not found.
 */
router.patch('/:id/deactivate', authorizePermissions('warehouse.delete'), WarehouseValidator.idParam, WarehouseController.deactivate);

export default router;

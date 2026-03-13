import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { PermissionController, PermissionValidator } from '../modules/permission';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin'));

/**
 * @openapi
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: List permissions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Permissions fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Permissions fetched successfully"
 *               data:
 *                 - code: "stock.view"
 *                   module: "stock"
 *                   name: "Stock View"
 */
router.get('/', authorizePermissions('permission.view'), PermissionController.list);

/**
 * @openapi
 * /permissions:
 *   post:
 *     tags: [Permissions]
 *     summary: Create permission
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Custom Permission"
 *             code: "custom.module.action"
 *             module: "custom"
 *             description: "Custom action"
 *     responses:
 *       201:
 *         description: Permission created
 */
router.post('/', authorizePermissions('permission.assign'), PermissionValidator.create, PermissionController.create);

/**
 * @openapi
 * /permissions/{id}:
 *   patch:
 *     tags: [Permissions]
 *     summary: Update permission
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
 *             description: "Updated description"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Permission updated
 */
router.patch('/:id', authorizePermissions('permission.assign'), PermissionValidator.idParam, PermissionValidator.update, PermissionController.update);

export default router;

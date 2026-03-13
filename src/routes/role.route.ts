import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { RoleController, RoleValidator } from '../modules/role';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin'));

/**
 * @openapi
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List roles
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Roles fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Roles fetched successfully"
 *               data:
 *                 - code: "super_admin"
 *                   name: "Super Admin"
 *                 - code: "admin"
 *                   name: "Admin"
 */
router.get('/', authorizePermissions('role.view'), RoleController.list);

/**
 * @openapi
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create role
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Finance Ops"
 *             code: "finance_ops"
 *             description: "Finance operations role"
 *     responses:
 *       201:
 *         description: Role created
 */
router.post('/', authorizePermissions('role.create'), RoleValidator.create, RoleController.create);

/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role detail with permissions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role fetched
 */
router.get('/:id', authorizePermissions('role.view'), RoleValidator.idParam, RoleController.getById);

/**
 * @openapi
 * /roles/{id}:
 *   patch:
 *     tags: [Roles]
 *     summary: Update role
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
 *             name: "Updated Role"
 *             description: "Updated description"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch('/:id', authorizePermissions('role.update'), RoleValidator.idParam, RoleValidator.update, RoleController.update);

/**
 * @openapi
 * /roles/{id}/permissions:
 *   patch:
 *     tags: [Roles]
 *     summary: Set role permissions
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
 *             permissionCodes: ["stock.view", "stock.update", "sale-invoice.view"]
 *     responses:
 *       200:
 *         description: Role permissions updated
 */
router.patch(
  '/:id/permissions',
  authorizePermissions('permission.assign'),
  RoleValidator.idParam,
  RoleValidator.setPermissions,
  RoleController.setPermissions
);

export default router;

import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { UserController, UserValidator } from '../modules/user';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin'));

/**
 * @openapi
 * components:
 *   schemas:
 *     AdminUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67d20000f3f7fdb2e0b19001"
 *         name:
 *           type: string
 *           example: "Inventory Admin"
 *         email:
 *           type: string
 *           example: "admin1@example.com"
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "9876543210"
 *         role:
 *           type: string
 *           enum: [admin]
 *           example: "admin"
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["stock.view", "stock.update"]
 *         isActive:
 *           type: boolean
 *           example: true
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-03-10T08:20:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T07:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T07:00:00.000Z"
 *     AdminListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Admin users fetched successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminUser'
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 20
 *             total:
 *               type: number
 *               example: 1
 *
 * /admin-users:
 *   post:
 *     tags: [Admin Users]
 *     summary: Create admin user
 *     description: Create a new admin user with selected permissions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin full name.
 *                 example: "Inventory Admin"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique admin email.
 *                 example: "admin1@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Initial password.
 *                 example: "Admin@123456"
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 description: Contact number.
 *                 example: "9876543210"
 *               permissions:
 *                 type: array
 *                 description: Permission keys assigned to admin.
 *                 items:
 *                   type: string
 *                 example: ["stock.view", "stock.create"]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Admin user created successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Admin user created successfully"
 *               data:
 *                 _id: "67d20000f3f7fdb2e0b19001"
 *                 name: "Inventory Admin"
 *                 email: "admin1@example.com"
 *                 phone: "9876543210"
 *                 role: "admin"
 *                 permissions: ["stock.view", "stock.create"]
 *                 isActive: true
 *                 createdAt: "2026-03-10T07:00:00.000Z"
 *                 updatedAt: "2026-03-10T07:00:00.000Z"
 *       400:
 *         description: Validation failure or duplicate email.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 */
router.post('/', authorizePermissions('admin-user.create'), UserValidator.createAdmin, UserController.createAdmin);
/**
 * @openapi
 * /admin-users:
 *   get:
 *     tags: [Admin Users]
 *     summary: List admin users
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
 *         description: Search by admin name or email.
 *         example: "admin1"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin users fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminListResponse'
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 */
router.get('/', authorizePermissions('admin-user.view'), UserValidator.listAdmins, UserController.listAdmins);
/**
 * @openapi
 * /admin-users/{id}:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get admin user by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user id.
 *         example: "67d20000f3f7fdb2e0b19001"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user fetched successfully.
 *       400:
 *         description: Invalid id format.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 *       404:
 *         description: Admin user not found.
 */
router.get('/:id', authorizePermissions('admin-user.view'), UserValidator.idParam, UserController.getAdminById);
/**
 * @openapi
 * /admin-users/{id}:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Update admin user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name.
 *                 example: "Inventory Admin Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated unique email.
 *                 example: "admin1.updated@example.com"
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 description: Updated phone.
 *                 example: "9999999999"
 *               permissions:
 *                 type: array
 *                 description: Updated permission keys.
 *                 items:
 *                   type: string
 *                 example: ["stock.view", "stock.update"]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user updated successfully.
 *       400:
 *         description: Validation failure or duplicate email.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 *       404:
 *         description: Admin user not found.
 */
router.patch('/:id', authorizePermissions('admin-user.update'), UserValidator.idParam, UserValidator.updateAdmin, UserController.updateAdmin);
/**
 * @openapi
 * /admin-users/{id}/status:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Activate or deactivate admin user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: New active status.
 *                 example: false
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user status updated successfully.
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 *       404:
 *         description: Admin user not found.
 */
router.patch('/:id/status', authorizePermissions('admin-user.delete'), UserValidator.idParam, UserValidator.updateAdminStatus, UserController.updateAdminStatus);
/**
 * @openapi
 * /admin-users/{id}/password:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Reset admin user password
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: New password.
 *                 example: "NewAdmin@123456"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user password reset successfully.
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 *       404:
 *         description: Admin user not found.
 */
router.patch('/:id/password', authorizePermissions('admin-user.update'), UserValidator.idParam, UserValidator.resetAdminPassword, UserController.resetAdminPassword);
/**
 * @openapi
 * /admin-users/{id}/permissions:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Update admin user permissions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissions]
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Full permission key list to assign.
 *                 example: ["warehouse.view", "stock.view", "stock.update"]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user permissions updated successfully.
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 *       404:
 *         description: Admin user not found.
 */
router.patch('/:id/permissions', authorizePermissions('admin-user.update'), UserValidator.idParam, UserValidator.updateAdminPermissions, UserController.updateAdminPermissions);

export default router;

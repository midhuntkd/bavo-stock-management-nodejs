import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { UserController, UserValidator } from '../modules/user';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /admin-users:
 *   post:
 *     tags: [Users]
 *     summary: Create admin/staff user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, roleCode]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               phone: { type: string }
 *               roleCode: { type: string, example: admin }
 *               isActive: { type: boolean, example: true }
 *               permissions:
 *                 type: array
 *                 items: { type: string }
 *               permissionsCsv:
 *                 type: string
 *                 example: stock.view,stock.update
 *           example:
 *             name: "Ops Admin"
 *             email: "ops.admin@example.com"
 *             password: "Admin@123456"
 *             roleCode: "admin"
 *             isActive: true
 *             permissions: ["stock.view", "stock.update"]
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User created successfully"
 *               data:
 *                 _id: "67d20000f3f7fdb2e0b19001"
 *                 name: "Ops Admin"
 *                 email: "ops.admin@example.com"
 *                 roleCode: "admin"
 */
router.post('/', authorizePermissions('user.create'), UserValidator.create, UserController.create);

/**
 * @openapi
 * /admin-users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string, example: admin }
 *       - in: query
 *         name: roleCode
 *         schema: { type: string, example: staff }
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200:
 *         description: Users fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Users fetched successfully"
 *               data:
 *                 items: []
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   totalItems: 0
 *                   totalPages: 1
 */
router.get('/', authorizePermissions('user.view'), UserValidator.list, UserController.list);

/**
 * @openapi
 * /admin-users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User fetched
 */
router.get('/:id', authorizePermissions('user.view'), UserValidator.idParam, UserController.getById);

/**
 * @openapi
 * /admin-users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
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
 *             name: "Updated Admin"
 *             isActive: true
 *             permissionsCsv: "stock.view,stock.update"
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch('/:id', authorizePermissions('user.update'), UserValidator.idParam, UserValidator.update, UserController.update);

/**
 * @openapi
 * /admin-users/{id}/password:
 *   patch:
 *     tags: [Users]
 *     summary: Reset user password
 *     security:
 *       - bearerAuth: []
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
 *             password: "NewStrong@123"
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.patch(
  '/:id/password',
  authorizePermissions('user.update'),
  UserValidator.idParam,
  UserValidator.resetPassword,
  UserController.resetPassword
);

/**
 * @openapi
 * /admin-users/reset-password:
 *   post:
 *     tags: [Users]
 *     summary: Reset user password by email and send it on email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             email: "ops.admin@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post(
  '/reset-password',
  authorizePermissions('user.update'),
  UserValidator.resetPasswordByEmail,
  UserController.resetPasswordByEmail
);

export default router;

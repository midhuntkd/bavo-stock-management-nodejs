import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { UserController, UserValidator } from '../modules/user';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin'));

/**
 * @openapi
 * /admin-users:
 *   post:
 *     tags: [Admin Users]
 *     summary: Create admin user
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('admin-user.create'), UserValidator.createAdmin, UserController.createAdmin);
/**
 * @openapi
 * /admin-users:
 *   get:
 *     tags: [Admin Users]
 *     summary: List admin users
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authorizePermissions('admin-user.view'), UserValidator.listAdmins, UserController.listAdmins);
/**
 * @openapi
 * /admin-users/{id}:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get admin user by id
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('admin-user.view'), UserValidator.idParam, UserController.getAdminById);
/**
 * @openapi
 * /admin-users/{id}:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Update admin user
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', authorizePermissions('admin-user.update'), UserValidator.idParam, UserValidator.updateAdmin, UserController.updateAdmin);
/**
 * @openapi
 * /admin-users/{id}/status:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Activate or deactivate admin user
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', authorizePermissions('admin-user.delete'), UserValidator.idParam, UserValidator.updateAdminStatus, UserController.updateAdminStatus);
/**
 * @openapi
 * /admin-users/{id}/password:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Reset admin user password
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/password', authorizePermissions('admin-user.update'), UserValidator.idParam, UserValidator.resetAdminPassword, UserController.resetAdminPassword);
/**
 * @openapi
 * /admin-users/{id}/permissions:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Update admin user permissions
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/permissions', authorizePermissions('admin-user.update'), UserValidator.idParam, UserValidator.updateAdminPermissions, UserController.updateAdminPermissions);

export default router;

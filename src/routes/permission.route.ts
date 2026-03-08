import { Router } from 'express';
import { authenticate, authorizeRoles } from '../modules/auth';
import { PermissionController } from '../modules/permission';

const router = Router();

/**
 * @openapi
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: List active permissions
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, authorizeRoles('super_admin'), PermissionController.list);

export default router;

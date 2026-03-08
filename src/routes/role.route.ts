import { Router } from 'express';
import { authenticate, authorizeRoles } from '../modules/auth';
import { RoleController } from '../modules/role';

const router = Router();

/**
 * @openapi
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List available roles
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, authorizeRoles('super_admin'), RoleController.list);

export default router;

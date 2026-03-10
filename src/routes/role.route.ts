import { Router } from 'express';
import { authenticate, authorizeRoles } from '../modules/auth';
import { RoleController } from '../modules/role';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     RoleItem:
 *       type: string
 *       enum: [super_admin, admin]
 *       example: "admin"
 *
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List available roles
 *     description: Returns all supported role keys in the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Roles fetched successfully"
 *               data: ["super_admin", "admin"]
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 */
router.get('/', authenticate, authorizeRoles('super_admin'), RoleController.list);

export default router;

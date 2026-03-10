import { Router } from 'express';
import { authenticate, authorizeRoles } from '../modules/auth';
import { PermissionController } from '../modules/permission';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     PermissionItem:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           example: "stock.view"
 *         description:
 *           type: string
 *           example: "View stock items"
 *         group:
 *           type: string
 *           example: "stock"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T05:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T05:00:00.000Z"
 *
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: List active permissions
 *     description: Returns active permission list for access control management.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Permissions fetched successfully"
 *               data:
 *                 - key: "stock.view"
 *                   description: "View stock items"
 *                   group: "stock"
 *                   isActive: true
 *                 - key: "stock.create"
 *                   description: "Create stock items"
 *                   group: "stock"
 *                   isActive: true
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (super_admin only).
 */
router.get('/', authenticate, authorizeRoles('super_admin'), PermissionController.list);

export default router;

import { Router } from 'express';
import { AuthController, AuthValidator, authenticate } from '../modules/auth';
import { UserController, UserValidator } from '../modules/user';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *           example:
 *             email: "superadmin@example.com"
 *             password: "Admin@123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   _id: "67d12ef0f3f7fdb2e0b18a11"
 *                   name: "Super Admin"
 *                   email: "superadmin@example.com"
 *                   roleCode: "super_admin"
 *                 tokens:
 *                   access:
 *                     token: "<jwt-access-token>"
 *                     expires: "2026-03-12T10:30:00.000Z"
 *                   refresh:
 *                     token: "<jwt-refresh-token>"
 *                     expires: "2026-04-11T10:00:00.000Z"
 */
router.post('/login', AuthValidator.login, AuthController.login);

/**
 * @openapi
 * /auth/refresh-tokens:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh auth tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *           example:
 *             refreshToken: "<jwt-refresh-token>"
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Token refreshed successfully"
 *               data:
 *                 tokens:
 *                   access:
 *                     token: "<new-access-token>"
 *                     expires: "2026-03-12T10:45:00.000Z"
 *                   refresh:
 *                     token: "<new-refresh-token>"
 *                     expires: "2026-04-11T10:15:00.000Z"
 */
router.post('/refresh-tokens', AuthValidator.refreshTokens, AuthController.refreshTokens);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *           example:
 *             refreshToken: "<jwt-refresh-token>"
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Logout successful"
 */
router.post('/logout', AuthValidator.logout, AuthController.logout);

/**
 * @openapi
 * /auth/access-id:
 *   post:
 *     tags: [Auth]
 *     summary: Get user access ID by email
 *     security:
 *       - basicAuth: []
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
 *             email: "superadmin@example.com"
 *     responses:
 *       200:
 *         description: Access ID fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Access ID fetched successfully"
 *               data:
 *                 _id: "67d12ef0f3f7fdb2e0b18a11"
 *                 email: "superadmin@example.com"
 *                 accessId: "1d45bc1d-22c8-4421-9b77-3e3a421cb822"
 */
router.post('/access-id', AuthValidator.accessIdByEmail, AuthController.accessIdByEmail);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Profile fetched successfully"
 *               data:
 *                 _id: "67d12ef0f3f7fdb2e0b18a11"
 *                 name: "Super Admin"
 *                 email: "superadmin@example.com"
 *                 roleCode: "super_admin"
 *                 effectivePermissions: ["*"]
 */
router.get('/me', authenticate, AuthController.me);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change own password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Accepts either `previousPassword` + `currentPassword` or legacy `currentPassword` + `newPassword`.
 *             properties:
 *               previousPassword:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *           example:
 *             previousPassword: "Admin@123456"
 *             currentPassword: "Admin@654321"
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Password changed successfully"
 *               data:
 *                 _id: "67d12ef0f3f7fdb2e0b18a11"
 */
router.post('/change-password', authenticate, UserValidator.changePassword, UserController.changeMyPassword);

export default router;

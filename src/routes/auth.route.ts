import { Router } from 'express';
import { AuthController, AuthValidator, authenticate } from '../modules/auth';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     AuthUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67d12ef0f3f7fdb2e0b18a11"
 *         name:
 *           type: string
 *           example: "Super Admin"
 *         email:
 *           type: string
 *           example: "superadmin@example.com"
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "9999999999"
 *         role:
 *           type: string
 *           enum: [super_admin, admin]
 *           example: "super_admin"
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["stock.view", "stock.create"]
 *         isActive:
 *           type: boolean
 *           example: true
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-03-10T08:20:00.000Z"
 *     AuthTokens:
 *       type: object
 *       properties:
 *         access:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access"
 *             expires:
 *               type: string
 *               format: date-time
 *               example: "2026-03-10T09:00:00.000Z"
 *         refresh:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh"
 *             expires:
 *               type: string
 *               format: date-time
 *               example: "2026-04-09T08:30:00.000Z"
 *     AuthErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Incorrect email or password"
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     description: Authenticate a user and return user profile with access and refresh tokens.
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
 *                 description: User email.
 *                 example: "superadmin@example.com"
 *               password:
 *                 type: string
 *                 description: User password.
 *                 example: "Admin@123456"
 *     responses:
 *       200:
 *         description: Login successful.
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
 *                   role: "super_admin"
 *                   permissions: ["stock.view", "stock.create"]
 *                   isActive: true
 *                   lastLoginAt: "2026-03-10T08:20:00.000Z"
 *                 tokens:
 *                   access:
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access"
 *                     expires: "2026-03-10T09:00:00.000Z"
 *                   refresh:
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh"
 *                     expires: "2026-04-09T08:30:00.000Z"
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Incorrect credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 *       403:
 *         description: User account inactive.
 */
router.post('/login', AuthValidator.login, AuthController.login);
/**
 * @openapi
 * /auth/refresh-tokens:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token
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
 *                 description: Valid refresh token from login.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh"
 *     responses:
 *       200:
 *         description: Token refreshed successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Token refreshed successfully"
 *               data:
 *                 tokens:
 *                   access:
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access"
 *                     expires: "2026-03-10T10:00:00.000Z"
 *                   refresh:
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_refresh"
 *                     expires: "2026-04-09T09:00:00.000Z"
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Invalid or expired refresh token.
 */
router.post('/refresh-tokens', AuthValidator.refreshTokens, AuthController.refreshTokens);
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate refresh token
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
 *                 description: Refresh token to invalidate.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh"
 *     responses:
 *       200:
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Logout successful"
 *       400:
 *         description: Invalid request body.
 */
router.post('/logout', AuthValidator.logout, AuthController.logout);
/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated profile
 *     description: Returns currently authenticated user's profile from JWT context.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Profile fetched successfully"
 *               data:
 *                 _id: "67d12ef0f3f7fdb2e0b18a11"
 *                 name: "Super Admin"
 *                 email: "superadmin@example.com"
 *                 phone: "9999999999"
 *                 role: "super_admin"
 *                 permissions: ["stock.view", "stock.create"]
 *                 isActive: true
 *                 lastLoginAt: "2026-03-10T08:20:00.000Z"
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
router.get('/me', authenticate, AuthController.me);

export default router;

import { Router } from 'express';
import { AuthController, AuthValidator, authenticate } from '../modules/auth';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 */
router.post('/login', AuthValidator.login, AuthController.login);
/**
 * @openapi
 * /auth/refresh-tokens:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token
 */
router.post('/refresh-tokens', AuthValidator.refreshTokens, AuthController.refreshTokens);
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate refresh token
 */
router.post('/logout', AuthValidator.logout, AuthController.logout);
/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated profile
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, AuthController.me);

export default router;

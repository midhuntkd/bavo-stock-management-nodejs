import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Check API health status
 *     description: Public health endpoint for uptime and service status checks.
 *     responses:
 *       200:
 *         description: Health check successful.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Health check successful"
 *               data:
 *                 status: "ok"
 *                 uptime: 1234.56
 *                 timestamp: "2026-03-10T10:30:00.000Z"
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Health check successful',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;

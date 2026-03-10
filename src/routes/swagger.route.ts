import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../modules/swagger';

const router = Router();

/**
 * @openapi
 * /docs:
 *   get:
 *     tags: [Docs]
 *     summary: Swagger UI
 *     description: Serves interactive API documentation UI when ENABLE_DOCS=true.
 *     responses:
 *       200:
 *         description: Swagger UI page.
 */
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec));

export default router;

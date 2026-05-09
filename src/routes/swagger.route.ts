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
router.get('/', (req, res, next) => {
  const runtimeServerUrl = `${req.protocol}://${req.get('host')}/api/v1`;
  const spec = {
    ...swaggerSpec,
    servers: [{ url: runtimeServerUrl }],
  };

  return swaggerUi.setup(spec)(req, res, next);
});

export default router;

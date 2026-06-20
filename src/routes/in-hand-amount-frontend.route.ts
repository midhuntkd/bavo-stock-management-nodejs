import { Router } from 'express';
import { authenticateUserAccessId } from '../modules/auth';
import { InHandAmountController, InHandAmountValidator } from '../modules/in-hand-amount';

const router = Router();

router.use(authenticateUserAccessId);

/**
 * @openapi
 * /frontend/in-hand-amounts:
 *   post:
 *     tags: [Frontend In Hand Amount]
 *     summary: Create own in-hand amount by access ID
 *     security:
 *       - userAccessIdAuth: []
 */
router.post('/', InHandAmountValidator.frontendCreate, InHandAmountController.frontendCreate);

export default router;

import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { InvestmentController, InvestmentValidator } from '../modules/investment';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /investments:
 *   post:
 *     tags: [Accounting]
 *     summary: Create investment
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Accounting]
 *     summary: List investments
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('investment.create'), uploadImage.single('proof'), InvestmentValidator.create, InvestmentController.create);
router.get('/', authorizePermissions('investment.view'), InvestmentValidator.list, InvestmentController.list);

/**
 * @openapi
 * /investments/summary:
 *   get:
 *     tags: [Accounting]
 *     summary: Investment summary
 *     security:
 *       - bearerAuth: []
 */
router.get('/summary', authorizePermissions('investment.view'), InvestmentValidator.summary, InvestmentController.summary);

/**
 * @openapi
 * /investments/{id}:
 *   get:
 *     tags: [Accounting]
 *     summary: Investment detail
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags: [Accounting]
 *     summary: Update investment
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Accounting]
 *     summary: Delete draft investment
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('investment.view'), InvestmentValidator.idParam, InvestmentController.getById);
router.patch('/:id', authorizePermissions('investment.update'), uploadImage.single('proof'), InvestmentValidator.idParam, InvestmentValidator.update, InvestmentController.update);

/**
 * @openapi
 * /investments/{id}/confirm:
 *   patch:
 *     tags: [Accounting]
 *     summary: Confirm investment
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/confirm', authorizePermissions('investment.status'), InvestmentValidator.idParam, InvestmentController.confirm);

/**
 * @openapi
 * /investments/{id}/cancel:
 *   patch:
 *     tags: [Accounting]
 *     summary: Cancel investment
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/cancel', authorizePermissions('investment.status'), InvestmentValidator.idParam, InvestmentController.cancel);
router.delete('/:id', authorizePermissions('investment.delete'), InvestmentValidator.idParam, InvestmentController.remove);

export default router;

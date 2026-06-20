import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { ReimbursementController, ReimbursementValidator } from '../modules/reimbursement';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /reimbursements:
 *   post:
 *     tags: [Accounting]
 *     summary: Create reimbursement
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Accounting]
 *     summary: List reimbursements
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('reimbursement.create', 'personal-spend.clear'), uploadImage.single('proof'), ReimbursementValidator.create, ReimbursementController.create);
router.get('/', authorizePermissions('reimbursement.view'), ReimbursementValidator.list, ReimbursementController.list);

/**
 * @openapi
 * /reimbursements/monthly-history:
 *   get:
 *     tags: [Accounting]
 *     summary: Monthly reimbursement history
 *     security:
 *       - bearerAuth: []
 */
router.get('/monthly-history', authorizePermissions('reimbursement.view'), ReimbursementValidator.monthlyHistory, ReimbursementController.monthlyHistory);

/**
 * @openapi
 * /reimbursements/{id}:
 *   get:
 *     tags: [Accounting]
 *     summary: Reimbursement detail
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags: [Accounting]
 *     summary: Update reimbursement
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('reimbursement.view'), ReimbursementValidator.idParam, ReimbursementController.getById);
router.patch('/:id', authorizePermissions('reimbursement.update'), uploadImage.single('proof'), ReimbursementValidator.idParam, ReimbursementValidator.update, ReimbursementController.update);

/**
 * @openapi
 * /reimbursements/{id}/cancel:
 *   patch:
 *     tags: [Accounting]
 *     summary: Cancel reimbursement
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/cancel', authorizePermissions('reimbursement.approve'), ReimbursementValidator.idParam, ReimbursementController.cancel);

export default router;

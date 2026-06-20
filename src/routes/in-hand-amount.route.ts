import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { InHandAmountController, InHandAmountValidator } from '../modules/in-hand-amount';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /in-hand-amounts:
 *   post:
 *     tags: [Accounting]
 *     summary: Create user in-hand amount record
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Accounting]
 *     summary: List user in-hand amount records
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('in-hand-amount.create'), InHandAmountValidator.create, InHandAmountController.create);
router.get('/', authorizePermissions('in-hand-amount.view'), InHandAmountValidator.list, InHandAmountController.list);

/**
 * @openapi
 * /in-hand-amounts/{id}:
 *   get:
 *     tags: [Accounting]
 *     summary: Get user in-hand amount record
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags: [Accounting]
 *     summary: Update user in-hand amount record
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Accounting]
 *     summary: Delete user in-hand amount record
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('in-hand-amount.view'), InHandAmountValidator.idParam, InHandAmountController.getById);
router.patch('/:id', authorizePermissions('in-hand-amount.update'), InHandAmountValidator.idParam, InHandAmountValidator.update, InHandAmountController.update);
router.delete('/:id', authorizePermissions('in-hand-amount.delete'), InHandAmountValidator.idParam, InHandAmountController.remove);

export default router;

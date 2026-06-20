import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { AccountTransactionController, AccountTransactionValidator } from '../modules/account-transaction';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /account-transactions:
 *   post:
 *     tags: [Accounting]
 *     summary: Create account transaction
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Accounting]
 *     summary: List account transactions
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('account-transaction.create'), uploadImage.single('proof'), AccountTransactionValidator.create, AccountTransactionController.create);
router.get('/', authorizePermissions('account-transaction.view'), AccountTransactionValidator.list, AccountTransactionController.list);

/**
 * @openapi
 * /account-transactions/{id}:
 *   get:
 *     tags: [Accounting]
 *     summary: Account transaction detail
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags: [Accounting]
 *     summary: Update account transaction
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('account-transaction.view'), AccountTransactionValidator.idParam, AccountTransactionController.getById);
router.patch('/:id', authorizePermissions('account-transaction.update'), uploadImage.single('proof'), AccountTransactionValidator.idParam, AccountTransactionValidator.update, AccountTransactionController.update);

/**
 * @openapi
 * /account-transactions/{id}/cancel:
 *   patch:
 *     tags: [Accounting]
 *     summary: Cancel account transaction
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/cancel', authorizePermissions('account-transaction.delete'), AccountTransactionValidator.idParam, AccountTransactionValidator.cancel, AccountTransactionController.cancel);

export default router;

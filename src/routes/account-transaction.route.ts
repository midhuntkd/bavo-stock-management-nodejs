import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { AccountTransactionController, AccountTransactionValidator } from '../modules/account-transaction';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'director'));

router.post('/', authorizePermissions('account-transaction.create'), uploadImage.single('proof'), AccountTransactionValidator.create, AccountTransactionController.create);
router.get('/', authorizePermissions('account-transaction.view'), AccountTransactionValidator.list, AccountTransactionController.list);
router.get('/:id', authorizePermissions('account-transaction.view'), AccountTransactionValidator.idParam, AccountTransactionController.getById);
router.patch('/:id', authorizePermissions('account-transaction.update'), uploadImage.single('proof'), AccountTransactionValidator.idParam, AccountTransactionValidator.update, AccountTransactionController.update);
router.patch('/:id/cancel', authorizePermissions('account-transaction.delete'), AccountTransactionValidator.idParam, AccountTransactionValidator.cancel, AccountTransactionController.cancel);

export default router;
import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { AccountController, AccountValidator } from '../modules/account';

const router = Router();

router.use(authenticate);

router.post('/', authorizePermissions('account.create'), AccountValidator.create, AccountController.create);
router.get('/', authorizePermissions('account.view'), AccountValidator.list, AccountController.list);
router.get('/summary', authorizePermissions('account.view'), AccountValidator.statement, AccountController.summary);
router.get('/:id', authorizePermissions('account.view'), AccountValidator.idParam, AccountController.getById);
router.get('/:id/statement', authorizePermissions('account.view'), AccountValidator.idParam, AccountValidator.statement, AccountController.statement);
router.patch('/:id', authorizePermissions('account.update'), AccountValidator.idParam, AccountValidator.update, AccountController.update);
router.patch('/:id/status', authorizePermissions('account.update'), AccountValidator.idParam, AccountValidator.status, AccountController.updateStatus);

export default router;

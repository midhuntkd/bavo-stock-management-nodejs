import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { AccountController, AccountValidator } from '../modules/account';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /accounts:
 *   post:
 *     tags: [Accounting]
 *     summary: Create account
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Accounting]
 *     summary: List accounts
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('account.create'), AccountValidator.create, AccountController.create);
router.get('/', authorizePermissions('account.view'), AccountValidator.list, AccountController.list);

/**
 * @openapi
 * /accounts/summary:
 *   get:
 *     tags: [Accounting]
 *     summary: Account summaries
 *     security:
 *       - bearerAuth: []
 */
router.get('/summary', authorizePermissions('account.view'), AccountValidator.statement, AccountController.summary);

/**
 * @openapi
 * /accounts/{id}:
 *   get:
 *     tags: [Accounting]
 *     summary: Account detail
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags: [Accounting]
 *     summary: Update account
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('account.view'), AccountValidator.idParam, AccountController.getById);

/**
 * @openapi
 * /accounts/{id}/statement:
 *   get:
 *     tags: [Accounting]
 *     summary: Account statement
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/statement', authorizePermissions('account.view'), AccountValidator.idParam, AccountValidator.statement, AccountController.statement);
router.patch('/:id', authorizePermissions('account.update'), AccountValidator.idParam, AccountValidator.update, AccountController.update);

/**
 * @openapi
 * /accounts/{id}/status:
 *   patch:
 *     tags: [Accounting]
 *     summary: Activate or deactivate account
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', authorizePermissions('account.update'), AccountValidator.idParam, AccountValidator.status, AccountController.updateStatus);

export default router;

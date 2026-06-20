import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { CompanyExpenseController, CompanyExpenseValidator } from '../modules/company-expense';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /company-expenses:
 *   post:
 *     tags: [Accounting]
 *     summary: Create company expense
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Accounting]
 *     summary: List company expenses
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authorizePermissions('company-expense.create'),
  uploadImage.single('proof'),
  CompanyExpenseValidator.create,
  CompanyExpenseController.create
);
router.get('/', authorizePermissions('company-expense.view'), CompanyExpenseValidator.list, CompanyExpenseController.list);

/**
 * @openapi
 * /company-expenses/{id}:
 *   get:
 *     tags: [Accounting]
 *     summary: Company expense detail
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags: [Accounting]
 *     summary: Update company expense
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Accounting]
 *     summary: Delete draft company expense
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('company-expense.view'), CompanyExpenseValidator.idParam, CompanyExpenseController.getById);
router.patch(
  '/:id',
  authorizePermissions('company-expense.update'),
  uploadImage.single('proof'),
  CompanyExpenseValidator.idParam,
  CompanyExpenseValidator.update,
  CompanyExpenseController.update
);

/**
 * @openapi
 * /company-expenses/{id}/confirm:
 *   patch:
 *     tags: [Accounting]
 *     summary: Confirm company expense
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/confirm',
  authorizePermissions('company-expense.confirm'),
  CompanyExpenseValidator.idParam,
  CompanyExpenseController.confirm
);

/**
 * @openapi
 * /company-expenses/{id}/cancel:
 *   patch:
 *     tags: [Accounting]
 *     summary: Cancel company expense
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/cancel',
  authorizePermissions('company-expense.cancel'),
  CompanyExpenseValidator.idParam,
  CompanyExpenseValidator.status,
  CompanyExpenseController.cancel
);

/**
 * @openapi
 * /company-expenses/{id}:
 *   delete:
 *     tags: [Accounting]
 *     summary: Delete draft company expense
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authorizePermissions('company-expense.delete'),
  CompanyExpenseValidator.idParam,
  CompanyExpenseController.remove
);

export default router;

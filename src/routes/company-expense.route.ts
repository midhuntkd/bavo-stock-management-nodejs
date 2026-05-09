import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { CompanyExpenseController, CompanyExpenseValidator } from '../modules/company-expense';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorizePermissions('company-expense.create'),
  uploadImage.single('proof'),
  CompanyExpenseValidator.create,
  CompanyExpenseController.create
);
router.get('/', authorizePermissions('company-expense.view'), CompanyExpenseValidator.list, CompanyExpenseController.list);
router.get('/:id', authorizePermissions('company-expense.view'), CompanyExpenseValidator.idParam, CompanyExpenseController.getById);
router.patch(
  '/:id',
  authorizePermissions('company-expense.update'),
  uploadImage.single('proof'),
  CompanyExpenseValidator.idParam,
  CompanyExpenseValidator.update,
  CompanyExpenseController.update
);
router.patch(
  '/:id/confirm',
  authorizePermissions('company-expense.confirm'),
  CompanyExpenseValidator.idParam,
  CompanyExpenseController.confirm
);
router.patch(
  '/:id/cancel',
  authorizePermissions('company-expense.cancel'),
  CompanyExpenseValidator.idParam,
  CompanyExpenseValidator.status,
  CompanyExpenseController.cancel
);
router.delete(
  '/:id',
  authorizePermissions('company-expense.delete'),
  CompanyExpenseValidator.idParam,
  CompanyExpenseController.remove
);

export default router;

import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { InvestmentController, InvestmentValidator } from '../modules/investment';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'director'));

router.post('/', authorizePermissions('investment.create'), uploadImage.single('proof'), InvestmentValidator.create, InvestmentController.create);
router.get('/', authorizePermissions('investment.view'), InvestmentValidator.list, InvestmentController.list);
router.get('/summary', authorizePermissions('investment.view'), InvestmentValidator.summary, InvestmentController.summary);
router.get('/:id', authorizePermissions('investment.view'), InvestmentValidator.idParam, InvestmentController.getById);
router.patch('/:id', authorizePermissions('investment.update'), uploadImage.single('proof'), InvestmentValidator.idParam, InvestmentValidator.update, InvestmentController.update);
router.patch('/:id/confirm', authorizePermissions('investment.status'), InvestmentValidator.idParam, InvestmentController.confirm);
router.patch('/:id/cancel', authorizePermissions('investment.status'), InvestmentValidator.idParam, InvestmentController.cancel);
router.delete('/:id', authorizePermissions('investment.delete'), InvestmentValidator.idParam, InvestmentController.remove);

export default router;
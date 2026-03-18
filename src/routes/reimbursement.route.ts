import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { ReimbursementController, ReimbursementValidator } from '../modules/reimbursement';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'director'));

router.post('/', authorizePermissions('reimbursement.create', 'personal-spend.clear'), uploadImage.single('proof'), ReimbursementValidator.create, ReimbursementController.create);
router.get('/', authorizePermissions('reimbursement.view'), ReimbursementValidator.list, ReimbursementController.list);
router.get('/monthly-history', authorizePermissions('reimbursement.view'), ReimbursementValidator.monthlyHistory, ReimbursementController.monthlyHistory);
router.get('/:id', authorizePermissions('reimbursement.view'), ReimbursementValidator.idParam, ReimbursementController.getById);
router.patch('/:id', authorizePermissions('reimbursement.update'), uploadImage.single('proof'), ReimbursementValidator.idParam, ReimbursementValidator.update, ReimbursementController.update);
router.patch('/:id/cancel', authorizePermissions('reimbursement.approve'), ReimbursementValidator.idParam, ReimbursementController.cancel);

export default router;
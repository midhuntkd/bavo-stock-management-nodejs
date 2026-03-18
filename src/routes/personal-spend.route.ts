import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { PersonalSpendController, PersonalSpendValidator } from '../modules/personal-spend';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'director', 'staff'));

router.post('/', authorizePermissions('personal-spend.create'), uploadImage.single('proof'), PersonalSpendValidator.create, PersonalSpendController.create);
router.get('/', authorizePermissions('personal-spend.view'), PersonalSpendValidator.list, PersonalSpendController.list);
router.get('/:id', authorizePermissions('personal-spend.view'), PersonalSpendValidator.idParam, PersonalSpendController.getById);
router.patch('/:id', authorizePermissions('personal-spend.update'), uploadImage.single('proof'), PersonalSpendValidator.idParam, PersonalSpendValidator.update, PersonalSpendController.update);
router.patch('/:id/carry-forward', authorizePermissions('personal-spend.extend'), PersonalSpendValidator.idParam, PersonalSpendValidator.carryForward, PersonalSpendController.carryForward);
router.delete('/:id', authorizePermissions('personal-spend.delete'), PersonalSpendValidator.idParam, PersonalSpendController.remove);

export default router;
import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { PersonalSpendController, PersonalSpendValidator } from '../modules/personal-spend';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /personal-spends:
 *   post:
 *     tags: [Accounting]
 *     summary: Create personal spend
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Accounting]
 *     summary: List personal spends
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('personal-spend.create'), uploadImage.single('proof'), PersonalSpendValidator.create, PersonalSpendController.create);
router.get('/', authorizePermissions('personal-spend.view'), PersonalSpendValidator.list, PersonalSpendController.list);

/**
 * @openapi
 * /personal-spends/{id}:
 *   get:
 *     tags: [Accounting]
 *     summary: Personal spend detail
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags: [Accounting]
 *     summary: Update personal spend
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Accounting]
 *     summary: Delete personal spend
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('personal-spend.view'), PersonalSpendValidator.idParam, PersonalSpendController.getById);
router.patch('/:id', authorizePermissions('personal-spend.update'), uploadImage.single('proof'), PersonalSpendValidator.idParam, PersonalSpendValidator.update, PersonalSpendController.update);

/**
 * @openapi
 * /personal-spends/{id}/carry-forward:
 *   patch:
 *     tags: [Accounting]
 *     summary: Carry forward personal spend
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/carry-forward', authorizePermissions('personal-spend.extend'), PersonalSpendValidator.idParam, PersonalSpendValidator.carryForward, PersonalSpendController.carryForward);
router.delete('/:id', authorizePermissions('personal-spend.delete'), PersonalSpendValidator.idParam, PersonalSpendController.remove);

export default router;

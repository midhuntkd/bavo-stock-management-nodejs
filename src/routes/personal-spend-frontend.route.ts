import { Router } from 'express';
import { authenticateUserAccessId } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { PersonalSpendController, PersonalSpendValidator } from '../modules/personal-spend';

const router = Router();

router.use(authenticateUserAccessId);

/**
 * @openapi
 * /frontend/personal-spends:
 *   post:
 *     tags: [Frontend Personal Spend]
 *     summary: Create own personal spend by access ID
 *     security:
 *       - userAccessIdAuth: []
 *   get:
 *     tags: [Frontend Personal Spend]
 *     summary: List own personal spends by access ID
 *     security:
 *       - userAccessIdAuth: []
 */
router.post('/', uploadImage.single('proof'), PersonalSpendValidator.create, PersonalSpendController.frontendCreate);
router.get('/', PersonalSpendValidator.list, PersonalSpendController.frontendList);

/**
 * @openapi
 * /frontend/personal-spends/{id}:
 *   get:
 *     tags: [Frontend Personal Spend]
 *     summary: Get own personal spend by access ID
 *     security:
 *       - userAccessIdAuth: []
 *   patch:
 *     tags: [Frontend Personal Spend]
 *     summary: Update own personal spend by access ID
 *     security:
 *       - userAccessIdAuth: []
 *   delete:
 *     tags: [Frontend Personal Spend]
 *     summary: Delete own personal spend by access ID
 *     security:
 *       - userAccessIdAuth: []
 */
router.get('/:id', PersonalSpendValidator.idParam, PersonalSpendController.frontendGetById);
router.patch('/:id', uploadImage.single('proof'), PersonalSpendValidator.idParam, PersonalSpendValidator.update, PersonalSpendController.frontendUpdate);

/**
 * @openapi
 * /frontend/personal-spends/{id}/carry-forward:
 *   patch:
 *     tags: [Frontend Personal Spend]
 *     summary: Carry forward own personal spend by access ID
 *     security:
 *       - userAccessIdAuth: []
 */
router.patch('/:id/carry-forward', PersonalSpendValidator.idParam, PersonalSpendValidator.carryForward, PersonalSpendController.frontendCarryForward);
router.delete('/:id', PersonalSpendValidator.idParam, PersonalSpendController.frontendRemove);

export default router;

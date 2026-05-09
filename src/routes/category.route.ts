import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { CategoryController, CategoryValidator } from '../modules/category';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Beverages"
 *             description: "Drinks and beverage items"
 *             pageKey: "home-beverages"
 *             slug: "beverages"
 *             sortOrder: 1
 *             status: "Active"
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', authorizePermissions('category.create'), CategoryValidator.create, CategoryController.create);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: pageKey
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: ["Active", "Inactive", "Delete"] }
 *     responses:
 *       200:
 *         description: Categories fetched
 */
router.get('/', authorizePermissions('category.view'), CategoryValidator.list, CategoryController.list);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Category detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category fetched
 */
router.get('/:id', authorizePermissions('category.view'), CategoryValidator.idParam, CategoryController.getById);

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update category
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             description: "Updated drinks and beverage items"
 *             pageKey: "featured-beverages"
 *             sortOrder: 2
 *     responses:
 *       200:
 *         description: Category updated
 */
router.patch('/:id', authorizePermissions('category.update'), CategoryValidator.idParam, CategoryValidator.update, CategoryController.update);

/**
 * @openapi
 * /categories/{id}/status:
 *   patch:
 *     tags: [Categories]
 *     summary: Update category status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: "Inactive"
 *     responses:
 *       200:
 *         description: Category status updated
 */
router.patch('/:id/status', authorizePermissions('category.delete'), CategoryValidator.idParam, CategoryValidator.updateStatus, CategoryController.updateStatus);

export default router;

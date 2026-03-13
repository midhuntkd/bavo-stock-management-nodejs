import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { BrandController, BrandValidator } from '../modules/brand';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin', 'staff'));

/**
 * @openapi
 * /brands:
 *   post:
 *     tags: [Brands]
 *     summary: Create brand
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Knorr"
 *             code: "KNR"
 *             supplierId: "67d12f10f3f7fdb2e0b18a70"
 *             manufacturer: "Unilever"
 *             companyExecutiveName: "Shamshad"
 *             companyExecutiveNumber: "9846718941"
 *             category: "Food"
 *             description: "Instant food brand"
 *             logo: "https://cdn.example.com/brands/knorr.png"
 *             isActive: true
 *     responses:
 *       201:
 *         description: Brand created
 */
router.post('/', authorizePermissions('brand.create'), uploadImage.single('logo'), BrandValidator.create, BrandController.create);

/**
 * @openapi
 * /brands:
 *   get:
 *     tags: [Brands]
 *     summary: List brands
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: supplierId
 *         schema: { type: string }
 *       - in: query
 *         name: manufacturer
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200:
 *         description: Brands fetched
 */
router.get('/', authorizePermissions('brand.view'), BrandValidator.list, BrandController.list);

/**
 * @openapi
 * /brands/options:
 *   get:
 *     tags: [Brands]
 *     summary: List brand options
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Brand options fetched
 */
router.get('/options', authorizePermissions('brand.view'), BrandController.options);

/**
 * @openapi
 * /brands/by-supplier/{supplierId}:
 *   get:
 *     tags: [Brands]
 *     summary: List brands by supplier
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Brands fetched by supplier
 */
router.get('/by-supplier/:supplierId', authorizePermissions('brand.view'), BrandValidator.supplierIdParam, BrandController.bySupplier);

/**
 * @openapi
 * /brands/{id}:
 *   get:
 *     tags: [Brands]
 *     summary: Get brand detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Brand fetched
 */
router.get('/:id', authorizePermissions('brand.view'), BrandValidator.idParam, BrandController.getById);

/**
 * @openapi
 * /brands/{id}:
 *   patch:
 *     tags: [Brands]
 *     summary: Update brand
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
 *             name: "Knorr Updated"
 *             manufacturer: "Unilever India"
 *             companyExecutiveName: "Shamshad"
 *             companyExecutiveNumber: "9846718941"
 *     responses:
 *       200:
 *         description: Brand updated
 */
router.patch('/:id', authorizePermissions('brand.update'), uploadImage.single('logo'), BrandValidator.idParam, BrandValidator.update, BrandController.update);

/**
 * @openapi
 * /brands/{id}/status:
 *   patch:
 *     tags: [Brands]
 *     summary: Activate/deactivate brand
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
 *             isActive: false
 *     responses:
 *       200:
 *         description: Brand status updated
 */
router.patch('/:id/status', authorizePermissions('brand.status'), BrandValidator.idParam, BrandValidator.status, BrandController.updateStatus);

export default router;

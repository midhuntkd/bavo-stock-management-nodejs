import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { uploadJson } from '../middlewares/upload.middleware';
import { ProductController, ProductValidator } from '../modules/product';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /products/import:
 *   post:
 *     tags: [Products]
 *     summary: Import products from JSON
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           example:
 *             products:
 *               - name: "Cut Mango Pickle 500 g"
 *                 slug: "cut-mango-pickle-500-g"
 *                 sku: "DH-CMP-500"
 *                 price: 107
 *                 quantity: 120
 *                 unit: "g"
 *                 unitMeasurement: "weight"
 *                 unitValue: 500
 *                 status: "Inactive"
 *                 parentCategory:
 *                   - { "$oid": "694e9b9ff41d91150b976a5d" }
 *     responses:
 *       201:
 *         description: Products imported
 */
router.post('/import', authorizePermissions('product.create'), uploadJson.single('file'), ProductController.importJson);

/**
 * @openapi
 * /products/sync-bavo-admin:
 *   post:
 *     tags: [Products]
 *     summary: Sync products from Bavo Admin stock feed
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Products synced
 */
router.post('/sync-bavo-admin', authorizePermissions('product.sync'), ProductValidator.syncFromBavoAdmin, ProductController.syncFromBavoAdmin);

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create product
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Milk 500ml"
 *             slug: "milk-500ml"
 *             sku: "MILK-500"
 *             brandId: "67d12f40f3f7fdb2e0b18b40"
 *             manufacturer: "Unilever"
 *             category: "Dairy"
 *             categoryId: "Dairy"
 *             unit: "pc"
 *             unitMeasurement: "ml"
 *             unitValue: 500
 *             availableQuantity: 120
 *             gstRate: 5
 *             mrp: 40
 *             salePrice: 36
 *             costPrice: 30
 *             trackInventory: true
 *             batchEnabled: true
 *             expiryEnabled: true
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', authorizePermissions('product.create'), ProductValidator.create, ProductController.create);

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: brandId
 *         schema: { type: string }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: barcode
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ["true", "false"] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: ["active", "inactive"] }
 *       - in: query
 *         name: batchEnabled
 *         schema: { type: string, enum: ["true", "false"] }
 *       - in: query
 *         name: expiryEnabled
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200:
 *         description: Products fetched
 */
router.get('/', authorizePermissions('product.view'), ProductValidator.list, ProductController.list);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Product detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product fetched
 */
router.get('/:id', authorizePermissions('product.view'), ProductValidator.idParam, ProductController.getById);

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Update product
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
 *             salePrice: 37
 *             costPrice: 31
 *             unitMeasurement: "ml"
 *             unitValue: 500
 *             availableQuantity: 140
 *             category: "Dairy"
 *             brandId: "67d12f40f3f7fdb2e0b18b40"
 *             manufacturer: "Unilever India"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch('/:id', authorizePermissions('product.update'), ProductValidator.idParam, ProductValidator.update, ProductController.update);

/**
 * @openapi
 * /products/{id}/status:
 *   patch:
 *     tags: [Products]
 *     summary: Activate/deactivate product
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
 *         description: Product status updated
 */
router.patch('/:id/status', authorizePermissions('product.delete'), ProductValidator.idParam, ProductValidator.update, ProductController.setActiveState);

export default router;

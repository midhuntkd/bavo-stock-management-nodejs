import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { SupplierController, SupplierValidator } from '../modules/supplier';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /suppliers:
 *   post:
 *     tags: [Suppliers]
 *     summary: Create supplier
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "ABC Foods"
 *             code: "SUP-ABC"
 *             contactPerson: "Sameer"
 *             phone: "9999999999"
 *             email: "abc@vendor.com"
 *             gstNo: "32ABCDE1234F1Z5"
 *             address: "Ernakulam"
 *     responses:
 *       201:
 *         description: Supplier created
 */
router.post('/', authorizePermissions('supplier.create'), SupplierValidator.create, SupplierController.create);

/**
 * @openapi
 * /suppliers:
 *   get:
 *     tags: [Suppliers]
 *     summary: List suppliers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Suppliers fetched
 */
router.get('/', authorizePermissions('supplier.view'), SupplierValidator.list, SupplierController.list);

/**
 * @openapi
 * /suppliers/{id}:
 *   get:
 *     tags: [Suppliers]
 *     summary: Supplier detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: includeBrands
 *         schema: { type: string, enum: ["true", "false"] }
 *         description: Include brands for this supplier when true.
 *     responses:
 *       200:
 *         description: Supplier fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Supplier fetched successfully"
 *               data:
 *                 _id: "67d12f10f3f7fdb2e0b18a70"
 *                 name: "Unilever"
 *                 code: "SUP-UNI"
 *                 brandCount: 3
 *                 brands:
 *                   - _id: "67d12f40f3f7fdb2e0b18b40"
 *                     name: "Knorr"
 *                   - _id: "67d12f40f3f7fdb2e0b18b41"
 *                     name: "Kissan"
 */
router.get('/:id', authorizePermissions('supplier.view'), SupplierValidator.detail, SupplierController.getById);

/**
 * @openapi
 * /suppliers/{id}:
 *   patch:
 *     tags: [Suppliers]
 *     summary: Update supplier
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
 *             contactPerson: "Shafi"
 *             phone: "8888888888"
 *     responses:
 *       200:
 *         description: Supplier updated
 */
router.patch('/:id', authorizePermissions('supplier.update'), SupplierValidator.idParam, SupplierValidator.update, SupplierController.update);

/**
 * @openapi
 * /suppliers/{id}/status:
 *   patch:
 *     tags: [Suppliers]
 *     summary: Activate/deactivate supplier
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
 *         description: Supplier status updated
 */
router.patch('/:id/status', authorizePermissions('supplier.delete'), SupplierValidator.idParam, SupplierValidator.update, SupplierController.setActiveState);

export default router;

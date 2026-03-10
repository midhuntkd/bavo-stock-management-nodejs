import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { uploadImage } from '../middlewares/upload.middleware';
import { StockController, StockValidator } from '../modules/stock';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin'));

/**
 * @openapi
 * components:
 *   schemas:
 *     StockItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB id of the stock item.
 *           example: "67d12f40f3f7fdb2e0b18a31"
 *         productName:
 *           type: string
 *           example: "Sample Product"
 *         hsnCode:
 *           type: string
 *           example: "HSN1001"
 *         barcode:
 *           type: string
 *           example: "8900000000012"
 *         salePrice:
 *           type: number
 *           example: 120
 *         gst:
 *           type: number
 *           example: 18
 *         mrp:
 *           type: number
 *           example: 150
 *         actualPrice:
 *           type: number
 *           example: 100
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           example: "https://bucket-name.s3.ap-south-1.amazonaws.com/stocks/1741600000000-product.jpg"
 *         imageKey:
 *           type: string
 *           nullable: true
 *           example: "stocks/1741600000000-product.jpg"
 *         sku:
 *           type: string
 *           example: "SKU-1001"
 *         warehouseId:
 *           type: string
 *           example: "67d12f10f3f7fdb2e0b18a20"
 *         quantity:
 *           type: number
 *           example: 100
 *         reservedQuantity:
 *           type: number
 *           example: 5
 *         availableQuantity:
 *           type: number
 *           example: 95
 *         minimumStockLevel:
 *           type: number
 *           example: 10
 *         unit:
 *           type: string
 *           example: "pcs"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           example: "active"
 *         createdBy:
 *           type: string
 *           example: "67d12ef0f3f7fdb2e0b18a11"
 *         updatedBy:
 *           type: string
 *           example: "67d12ef0f3f7fdb2e0b18a11"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-10T09:30:00.000Z"
 *     StockListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Stock items fetched successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StockItem'
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 20
 *             total:
 *               type: number
 *               example: 1
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           nullable: true
 *           items:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 example: "body.quantity"
 *               message:
 *                 type: string
 *                 example: "\"quantity\" is required"
 *
 * /stocks:
 *   post:
 *     tags: [Stocks]
 *     summary: Create stock item
 *     description: Create a stock item in a warehouse. Supports optional image upload to S3 with multipart/form-data.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - hsnCode
 *               - barcode
 *               - salePrice
 *               - gst
 *               - mrp
 *               - actualPrice
 *               - sku
 *               - warehouseId
 *               - quantity
 *               - unit
 *             properties:
 *               productName:
 *                 type: string
 *                 description: Name of the product.
 *                 example: "Sample Product"
 *               hsnCode:
 *                 type: string
 *                 description: HSN code of the product.
 *                 example: "HSN1001"
 *               barcode:
 *                 type: string
 *                 description: Barcode value.
 *                 example: "8900000000012"
 *               salePrice:
 *                 type: number
 *                 description: Sale price per unit.
 *                 example: 120
 *               gst:
 *                 type: number
 *                 description: GST percentage.
 *                 example: 18
 *               mrp:
 *                 type: number
 *                 description: Maximum retail price.
 *                 example: 150
 *               actualPrice:
 *                 type: number
 *                 description: Actual purchase/base price.
 *                 example: 100
 *               sku:
 *                 type: string
 *                 description: SKU code (stored uppercase).
 *                 example: "SKU-1001"
 *               warehouseId:
 *                 type: string
 *                 description: Warehouse id where stock is created.
 *                 example: "67d12f10f3f7fdb2e0b18a20"
 *               quantity:
 *                 type: number
 *                 description: Total quantity in stock.
 *                 example: 100
 *               reservedQuantity:
 *                 type: number
 *                 description: Reserved quantity. Defaults to 0.
 *                 example: 0
 *               minimumStockLevel:
 *                 type: number
 *                 description: Low-stock alert threshold. Defaults to 0.
 *                 example: 10
 *               unit:
 *                 type: string
 *                 description: Unit of measurement.
 *                 example: "pcs"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Stock status.
 *                 example: "active"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (jpg/png/webp), max 5MB.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Stock item created successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock item created successfully"
 *               data:
 *                 _id: "67d12f40f3f7fdb2e0b18a31"
 *                 productName: "Sample Product"
 *                 hsnCode: "HSN1001"
 *                 barcode: "8900000000012"
 *                 salePrice: 120
 *                 gst: 18
 *                 mrp: 150
 *                 actualPrice: 100
 *                 imageUrl: "https://bucket-name.s3.ap-south-1.amazonaws.com/stocks/1741600000000-product.jpg"
 *                 imageKey: "stocks/1741600000000-product.jpg"
 *                 sku: "SKU-1001"
 *                 warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *                 quantity: 100
 *                 reservedQuantity: 0
 *                 availableQuantity: 100
 *                 minimumStockLevel: 10
 *                 unit: "pcs"
 *                 status: "active"
 *                 createdBy: "67d12ef0f3f7fdb2e0b18a11"
 *                 updatedBy: "67d12ef0f3f7fdb2e0b18a11"
 *                 createdAt: "2026-03-10T09:30:00.000Z"
 *                 updatedAt: "2026-03-10T09:30:00.000Z"
 *       400:
 *         description: Validation error or business rule violation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 */
router.post('/', authorizePermissions('stock.create'), uploadImage.single('image'), StockValidator.create, StockController.create);
/**
 * @openapi
 * /stocks:
 *   get:
 *     tags: [Stocks]
 *     summary: List stock items
 *     description: Get paginated stock items with optional search and filters.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Records per page.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search on productName and sku.
 *         example: "sku-1001"
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *         description: Filter by warehouse id.
 *         example: "67d12f10f3f7fdb2e0b18a20"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status.
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Set to "true" to return items where availableQuantity <= minimumStockLevel.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock items fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockListResponse'
 *             example:
 *               success: true
 *               message: "Stock items fetched successfully"
 *               data:
 *                 - _id: "67d12f40f3f7fdb2e0b18a31"
 *                   productName: "Sample Product"
 *                   hsnCode: "HSN1001"
 *                   barcode: "8900000000012"
 *                   salePrice: 120
 *                   gst: 18
 *                   mrp: 150
 *                   actualPrice: 100
 *                   imageUrl: "https://bucket-name.s3.ap-south-1.amazonaws.com/stocks/1741600000000-product.jpg"
 *                   imageKey: "stocks/1741600000000-product.jpg"
 *                   sku: "SKU-1001"
 *                   warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *                   quantity: 100
 *                   reservedQuantity: 0
 *                   availableQuantity: 100
 *                   minimumStockLevel: 10
 *                   unit: "pcs"
 *                   status: "active"
 *                   createdAt: "2026-03-10T09:30:00.000Z"
 *                   updatedAt: "2026-03-10T09:30:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 20
 *                 total: 1
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 */
router.get('/', authorizePermissions('stock.view'), StockValidator.list, StockController.list);
/**
 * @openapi
 * /stocks/{id}:
 *   get:
 *     tags: [Stocks]
 *     summary: Get stock item by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item id.
 *         example: "67d12f40f3f7fdb2e0b18a31"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock item fetched successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock item fetched successfully"
 *               data:
 *                 _id: "67d12f40f3f7fdb2e0b18a31"
 *                 productName: "Sample Product"
 *                 hsnCode: "HSN1001"
 *                 barcode: "8900000000012"
 *                 salePrice: 120
 *                 gst: 18
 *                 mrp: 150
 *                 actualPrice: 100
 *                 imageUrl: "https://bucket-name.s3.ap-south-1.amazonaws.com/stocks/1741600000000-product.jpg"
 *                 imageKey: "stocks/1741600000000-product.jpg"
 *                 sku: "SKU-1001"
 *                 warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *                 quantity: 100
 *                 reservedQuantity: 0
 *                 availableQuantity: 100
 *                 minimumStockLevel: 10
 *                 unit: "pcs"
 *                 status: "active"
 *                 createdAt: "2026-03-10T09:30:00.000Z"
 *                 updatedAt: "2026-03-10T09:30:00.000Z"
 *       400:
 *         description: Invalid id format.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 *       404:
 *         description: Stock item not found.
 */
router.get('/:id', authorizePermissions('stock.view'), StockValidator.idParam, StockController.getById);
/**
 * @openapi
 * /stocks/{id}:
 *   patch:
 *     tags: [Stocks]
 *     summary: Update stock item
 *     description: Update one or more stock fields and optionally replace image in S3.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item id.
 *         example: "67d12f40f3f7fdb2e0b18a31"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 description: Updated product name.
 *               hsnCode:
 *                 type: string
 *                 description: Updated HSN code.
 *               barcode:
 *                 type: string
 *                 description: Updated barcode.
 *               salePrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Updated sale price.
 *               gst:
 *                 type: number
 *                 minimum: 0
 *                 description: Updated GST percentage.
 *               mrp:
 *                 type: number
 *                 minimum: 0
 *                 description: Updated MRP.
 *               actualPrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Updated actual price.
 *               unit:
 *                 type: string
 *                 description: Updated unit.
 *               minimumStockLevel:
 *                 type: number
 *                 minimum: 0
 *                 description: Updated minimum stock level.
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Updated stock status.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file to replace current image.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock item updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock item updated successfully"
 *               data:
 *                 _id: "67d12f40f3f7fdb2e0b18a31"
 *                 productName: "Sample Product Updated"
 *                 hsnCode: "HSN1001"
 *                 barcode: "8900000000012"
 *                 salePrice: 125
 *                 gst: 18
 *                 mrp: 160
 *                 actualPrice: 105
 *                 imageUrl: "https://bucket-name.s3.ap-south-1.amazonaws.com/stocks/1741601111000-updated.jpg"
 *                 imageKey: "stocks/1741601111000-updated.jpg"
 *                 sku: "SKU-1001"
 *                 warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *                 quantity: 100
 *                 reservedQuantity: 0
 *                 availableQuantity: 100
 *                 minimumStockLevel: 10
 *                 unit: "pcs"
 *                 status: "active"
 *                 updatedAt: "2026-03-10T10:15:00.000Z"
 *       400:
 *         description: Invalid input or empty update payload.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (missing permission).
 *       404:
 *         description: Stock item not found.
 */
router.patch('/:id', authorizePermissions('stock.update'), uploadImage.single('image'), StockValidator.idParam, StockValidator.update, StockController.update);

/**
 * @openapi
 * /stocks/{id}/in:
 *   post:
 *     tags: [Stocks]
 *     summary: Stock in
 *     description: Increase stock quantity.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Quantity to add.
 *                 example: 20
 *               referenceType:
 *                 type: string
 *                 description: Source reference type (optional).
 *                 example: "purchase"
 *               referenceId:
 *                 type: string
 *                 description: Source reference id (optional).
 *                 example: "PO-1001"
 *               note:
 *                 type: string
 *                 description: Remarks (optional).
 *                 example: "Restocked from purchase order"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock in successful.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock in successful"
 *               data:
 *                 _id: "67d12f40f3f7fdb2e0b18a31"
 *                 quantity: 120
 *                 reservedQuantity: 5
 *                 availableQuantity: 115
 *       400:
 *         description: Invalid quantity.
 *       404:
 *         description: Stock item not found.
 */
router.post('/:id/in', authorizePermissions('stock.in'), StockValidator.idParam, StockValidator.stockIn, StockController.stockIn);
/**
 * @openapi
 * /stocks/{id}/out:
 *   post:
 *     tags: [Stocks]
 *     summary: Stock out
 *     description: Decrease stock quantity from available quantity.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Quantity to remove.
 *                 example: 5
 *               referenceType:
 *                 type: string
 *                 example: "sale"
 *               referenceId:
 *                 type: string
 *                 example: "INV-1001"
 *               note:
 *                 type: string
 *                 example: "Dispatched for invoice INV-1001"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock out successful.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock out successful"
 *               data:
 *                 _id: "67d12f40f3f7fdb2e0b18a31"
 *                 quantity: 95
 *                 reservedQuantity: 5
 *                 availableQuantity: 90
 *       400:
 *         description: Invalid quantity or insufficient available quantity.
 *       404:
 *         description: Stock item not found.
 */
router.post('/:id/out', authorizePermissions('stock.out'), StockValidator.idParam, StockValidator.stockOut, StockController.stockOut);
/**
 * @openapi
 * /stocks/{id}/adjust:
 *   post:
 *     tags: [Stocks]
 *     summary: Stock adjustment
 *     description: Adjust stock quantity with positive or negative quantity delta.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: Quantity delta. Positive adds stock, negative reduces stock.
 *                 example: -2
 *               referenceType:
 *                 type: string
 *                 example: "audit"
 *               referenceId:
 *                 type: string
 *                 example: "AUD-1001"
 *               note:
 *                 type: string
 *                 example: "Physical count mismatch correction"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock adjusted successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock adjusted successfully"
 *               data:
 *                 _id: "67d12f40f3f7fdb2e0b18a31"
 *                 quantity: 93
 *                 reservedQuantity: 5
 *                 availableQuantity: 88
 *       400:
 *         description: Invalid adjustment (results in invalid quantities).
 *       404:
 *         description: Stock item not found.
 */
router.post('/:id/adjust', authorizePermissions('stock.adjust'), StockValidator.idParam, StockValidator.adjust, StockController.adjust);
/**
 * @openapi
 * /stocks/transfer:
 *   post:
 *     tags: [Stocks]
 *     summary: Transfer stock between warehouses
 *     description: Move quantity from source stock item to target warehouse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceStockId, targetWarehouseId, quantity]
 *             properties:
 *               sourceStockId:
 *                 type: string
 *                 description: Source stock id to transfer from.
 *                 example: "67d12f40f3f7fdb2e0b18a31"
 *               targetWarehouseId:
 *                 type: string
 *                 description: Target warehouse id.
 *                 example: "67d13000f3f7fdb2e0b18a50"
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Quantity to transfer.
 *                 example: 10
 *               referenceType:
 *                 type: string
 *                 description: Transfer reference type.
 *                 example: "manual"
 *               referenceId:
 *                 type: string
 *                 description: Transfer reference id.
 *                 example: "TRN-1001"
 *               note:
 *                 type: string
 *                 description: Remarks for transfer.
 *                 example: "Inter-warehouse transfer"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock transferred successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock transferred successfully"
 *               data:
 *                 source:
 *                   _id: "67d12f40f3f7fdb2e0b18a31"
 *                   warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *                   quantity: 90
 *                   availableQuantity: 90
 *                 target:
 *                   _id: "67d13030f3f7fdb2e0b18a60"
 *                   warehouseId: "67d13000f3f7fdb2e0b18a50"
 *                   quantity: 10
 *                   availableQuantity: 10
 *       400:
 *         description: Invalid request, insufficient stock, or same source/target warehouse.
 *       404:
 *         description: Source stock not found.
 */
router.post('/transfer', authorizePermissions('stock.transfer'), StockValidator.transfer, StockController.transfer);
/**
 * @openapi
 * /stocks/{id}/reserve:
 *   post:
 *     tags: [Stocks]
 *     summary: Reserve stock quantity
 *     description: Reserve available stock quantity.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Quantity to reserve.
 *                 example: 8
 *               referenceType:
 *                 type: string
 *                 example: "order"
 *               referenceId:
 *                 type: string
 *                 example: "ORD-1001"
 *               note:
 *                 type: string
 *                 example: "Reserved for order ORD-1001"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock reserved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock reserved successfully"
 *               data:
 *                 _id: "67d12f40f3f7fdb2e0b18a31"
 *                 quantity: 100
 *                 reservedQuantity: 13
 *                 availableQuantity: 87
 *       400:
 *         description: Invalid quantity or insufficient available quantity.
 *       404:
 *         description: Stock item not found.
 */
router.post('/:id/reserve', authorizePermissions('stock.reserve'), StockValidator.idParam, StockValidator.reserve, StockController.reserve);
/**
 * @openapi
 * /stocks/{id}/release:
 *   post:
 *     tags: [Stocks]
 *     summary: Release reserved stock quantity
 *     description: Release previously reserved stock quantity.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Quantity to release from reserved quantity.
 *                 example: 3
 *               referenceType:
 *                 type: string
 *                 example: "order_cancel"
 *               referenceId:
 *                 type: string
 *                 example: "ORD-1001"
 *               note:
 *                 type: string
 *                 example: "Released due to order cancellation"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock released successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Stock released successfully"
 *               data:
 *                 _id: "67d12f40f3f7fdb2e0b18a31"
 *                 quantity: 100
 *                 reservedQuantity: 10
 *                 availableQuantity: 90
 *       400:
 *         description: Invalid quantity or insufficient reserved quantity.
 *       404:
 *         description: Stock item not found.
 */
router.post('/:id/release', authorizePermissions('stock.release'), StockValidator.idParam, StockValidator.release, StockController.release);

export default router;

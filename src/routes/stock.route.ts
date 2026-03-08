import { Router } from 'express';
import { authenticate, authorizePermissions, authorizeRoles } from '../modules/auth';
import { StockController, StockValidator } from '../modules/stock';

const router = Router();

router.use(authenticate, authorizeRoles('super_admin', 'admin'));

/**
 * @openapi
 * /stocks:
 *   post:
 *     tags: [Stocks]
 *     summary: Create stock item
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorizePermissions('stock.create'), StockValidator.create, StockController.create);
/**
 * @openapi
 * /stocks:
 *   get:
 *     tags: [Stocks]
 *     summary: List stock items
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authorizePermissions('stock.view'), StockValidator.list, StockController.list);
/**
 * @openapi
 * /stocks/{id}:
 *   get:
 *     tags: [Stocks]
 *     summary: Get stock item by id
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorizePermissions('stock.view'), StockValidator.idParam, StockController.getById);
/**
 * @openapi
 * /stocks/{id}:
 *   patch:
 *     tags: [Stocks]
 *     summary: Update stock item
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', authorizePermissions('stock.update'), StockValidator.idParam, StockValidator.update, StockController.update);

/**
 * @openapi
 * /stocks/{id}/in:
 *   post:
 *     tags: [Stocks]
 *     summary: Stock in
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/in', authorizePermissions('stock.in'), StockValidator.idParam, StockValidator.stockIn, StockController.stockIn);
/**
 * @openapi
 * /stocks/{id}/out:
 *   post:
 *     tags: [Stocks]
 *     summary: Stock out
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/out', authorizePermissions('stock.out'), StockValidator.idParam, StockValidator.stockOut, StockController.stockOut);
/**
 * @openapi
 * /stocks/{id}/adjust:
 *   post:
 *     tags: [Stocks]
 *     summary: Stock adjustment
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/adjust', authorizePermissions('stock.adjust'), StockValidator.idParam, StockValidator.adjust, StockController.adjust);
/**
 * @openapi
 * /stocks/transfer:
 *   post:
 *     tags: [Stocks]
 *     summary: Transfer stock between warehouses
 *     security:
 *       - bearerAuth: []
 */
router.post('/transfer', authorizePermissions('stock.transfer'), StockValidator.transfer, StockController.transfer);
/**
 * @openapi
 * /stocks/{id}/reserve:
 *   post:
 *     tags: [Stocks]
 *     summary: Reserve stock quantity
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/reserve', authorizePermissions('stock.reserve'), StockValidator.idParam, StockValidator.reserve, StockController.reserve);
/**
 * @openapi
 * /stocks/{id}/release:
 *   post:
 *     tags: [Stocks]
 *     summary: Release reserved stock quantity
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/release', authorizePermissions('stock.release'), StockValidator.idParam, StockValidator.release, StockController.release);

export default router;

import { Router } from 'express';
import { authenticate, authorizePermissions } from '../modules/auth';
import { ExpiryMarkdownController, ExpiryMarkdownValidator } from '../modules/expiry-markdown';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /expiry-markdown/rules:
 *   post:
 *     tags: [Expiry Markdown]
 *     summary: Create a tiered markdown rule
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Fresh Produce Markdown"
 *             tiers:
 *               - daysBeforeExpiry: 7
 *                 discountPercent: 20
 *               - daysBeforeExpiry: 3
 *                 discountPercent: 40
 *               - daysBeforeExpiry: 1
 *                 discountPercent: 60
 *     responses:
 *       201:
 *         description: Rule created
 */
router.post('/rules', authorizePermissions('stock-adjustment.create'), ExpiryMarkdownValidator.createRule, ExpiryMarkdownController.createRule);

/**
 * @openapi
 * /expiry-markdown/rules:
 *   get:
 *     tags: [Expiry Markdown]
 *     summary: List markdown rules
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Rules fetched
 */
router.get('/rules', authorizePermissions('stock-adjustment.view'), ExpiryMarkdownValidator.listRules, ExpiryMarkdownController.listRules);

/**
 * @openapi
 * /expiry-markdown/rules/{id}:
 *   get:
 *     tags: [Expiry Markdown]
 *     summary: Get markdown rule by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rule fetched
 */
router.get('/rules/:id', authorizePermissions('stock-adjustment.view'), ExpiryMarkdownValidator.idParam, ExpiryMarkdownController.getRuleById);

/**
 * @openapi
 * /expiry-markdown/rules/{id}:
 *   patch:
 *     tags: [Expiry Markdown]
 *     summary: Update a markdown rule
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rule updated
 */
router.patch('/rules/:id', authorizePermissions('stock-adjustment.create'), ExpiryMarkdownValidator.idParam, ExpiryMarkdownValidator.updateRule, ExpiryMarkdownController.updateRule);

/**
 * @openapi
 * /expiry-markdown/rules/{id}:
 *   delete:
 *     tags: [Expiry Markdown]
 *     summary: Delete a markdown rule
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rule deleted
 */
router.delete('/rules/:id', authorizePermissions('stock-adjustment.approve'), ExpiryMarkdownValidator.idParam, ExpiryMarkdownController.deleteRule);

/**
 * @openapi
 * /expiry-markdown/run:
 *   post:
 *     tags: [Expiry Markdown]
 *     summary: Trigger the expiry markdown job manually
 *     description: |
 *       Scans active batches nearing expiry and applies tiered price markdowns.
 *       Set dryRun=true to preview what would change without saving anything.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             warehouseId: "67d12f10f3f7fdb2e0b18a20"
 *             dryRun: false
 *     responses:
 *       200:
 *         description: Job result
 */
router.post('/run', authorizePermissions('stock-adjustment.approve'), ExpiryMarkdownValidator.runJob, ExpiryMarkdownController.runJob);

/**
 * @openapi
 * /expiry-markdown/logs:
 *   get:
 *     tags: [Expiry Markdown]
 *     summary: List markdown audit logs
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logs fetched
 */
router.get('/logs', authorizePermissions('stock-adjustment.view'), ExpiryMarkdownValidator.listLogs, ExpiryMarkdownController.listLogs);

export default router;

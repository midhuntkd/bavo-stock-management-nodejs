import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import StockBatch from '../stock-batch/stock-batch.model';
import { getPagination } from '../utils';
import { ExpiryMarkdownRule, MarkdownLog } from './expiry-markdown.model';

// ─── Rule Management ────────────────────────────────────────────────────────

export const createRule = async (payload: any) => {
  // Sort tiers descending so the highest day-window is evaluated first
  const tiers = [...(payload.tiers || [])].sort((a: any, b: any) => b.daysBeforeExpiry - a.daysBeforeExpiry);
  return ExpiryMarkdownRule.create({ ...payload, tiers });
};

export const listRules = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (typeof query.isActive !== 'undefined') filter.isActive = query.isActive === 'true';

  const [items, totalItems] = await Promise.all([
    ExpiryMarkdownRule.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ExpiryMarkdownRule.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

export const getRuleById = async (id: string) => {
  const rule = await ExpiryMarkdownRule.findById(id);
  if (!rule) throw new ApiError(httpStatus.NOT_FOUND, 'Markdown rule not found');
  return rule;
};

export const updateRule = async (id: string, payload: any) => {
  if (payload.tiers) {
    payload.tiers = [...payload.tiers].sort((a: any, b: any) => b.daysBeforeExpiry - a.daysBeforeExpiry);
  }
  const rule = await ExpiryMarkdownRule.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!rule) throw new ApiError(httpStatus.NOT_FOUND, 'Markdown rule not found');
  return rule;
};

export const deleteRule = async (id: string) => {
  const rule = await ExpiryMarkdownRule.findByIdAndDelete(id);
  if (!rule) throw new ApiError(httpStatus.NOT_FOUND, 'Markdown rule not found');
  return rule;
};

export const listMarkdownLogs = async (query: Record<string, any>) => {
  const { page, limit, skip } = getPagination(query);
  const filter: any = {};
  if (query.batchId) filter.batchId = query.batchId;
  if (query.productId) filter.productId = query.productId;
  if (query.warehouseId) filter.warehouseId = query.warehouseId;

  const [items, totalItems] = await Promise.all([
    MarkdownLog.find(filter).sort({ appliedAt: -1 }).skip(skip).limit(limit),
    MarkdownLog.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 } };
};

// ─── Core Markdown Job ───────────────────────────────────────────────────────

export interface MarkdownJobResult {
  processed: number;
  updated: number;
  skipped: number;
  errors: Array<{ batchId: string; reason: string }>;
}

/**
 * Scans active batches nearing expiry and applies tiered price markdowns.
 * Safe to run repeatedly — uses markdownApplied + tier tracking to prevent
 * double-discounting at the same tier.
 *
 * @param warehouseId  Optional — scope the job to one warehouse
 * @param dryRun       If true, returns what would happen without saving
 */
export const runExpiryMarkdownJob = async (warehouseId?: string, dryRun = false): Promise<MarkdownJobResult> => {
  const result: MarkdownJobResult = { processed: 0, updated: 0, skipped: 0, errors: [] };
  const now = new Date();

  // Fetch active rules (optionally scoped to warehouse or global)
  const ruleFilter: any = { isActive: true };
  if (warehouseId) ruleFilter.$or = [{ warehouseId }, { warehouseId: null }];
  const rules = await ExpiryMarkdownRule.find(ruleFilter);

  if (!rules.length) return result;

  // Compute the widest look-ahead window across all rules
  const maxDaysWindow = Math.max(...rules.flatMap((r) => r.tiers.map((t) => t.daysBeforeExpiry)));
  const windowDate = new Date(now.getTime() + maxDaysWindow * 24 * 60 * 60 * 1000);

  // Find active batches with expiry within the widest window
  const batchFilter: any = {
    status: 'active',
    expiryDate: { $gte: now, $lte: windowDate },
    availableQuantity: { $gt: 0 },
  };
  if (warehouseId) batchFilter.warehouseId = warehouseId;

  const batches = await StockBatch.find(batchFilter).populate('productId', 'categoryId');

  for (const batch of batches) {
    result.processed++;

    try {
      const expiry = batch.expiryDate!;
      const daysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      const productCategoryId = (batch.productId as any)?.categoryId;

      // Find the best matching rule: prefer warehouse+category, then warehouse-only, then global
      let bestRule = null;
      let bestTier = null;

      for (const rule of rules) {
        // Scope check
        if (rule.warehouseId && String(rule.warehouseId) !== String(batch.warehouseId)) continue;
        if (rule.categoryId && String(rule.categoryId) !== String(productCategoryId)) continue;

        // Find the applicable tier for this batch (highest days threshold that still applies)
        const applicableTier = rule.tiers.find((t) => daysToExpiry <= t.daysBeforeExpiry);
        if (!applicableTier) continue;

        // Prefer the rule with more specific scope
        const isMoreSpecific =
          !bestRule ||
          (rule.warehouseId && !bestRule.warehouseId) ||
          (rule.categoryId && !bestRule.categoryId);

        if (isMoreSpecific) {
          bestRule = rule;
          bestTier = applicableTier;
        }
      }

      if (!bestRule || !bestTier) {
        result.skipped++;
        continue;
      }

      // Skip if the same or higher discount is already applied
      if (batch.markdownPercent >= bestTier.discountPercent) {
        result.skipped++;
        continue;
      }

      // Preserve original price on first markdown
      const originalPrice = batch.originalSalePrice ?? batch.salePrice;
      const newSalePrice = parseFloat((originalPrice * (1 - bestTier.discountPercent / 100)).toFixed(2));

      if (dryRun) {
        result.updated++;
        continue;
      }

      // Apply the markdown
      batch.originalSalePrice = originalPrice;
      batch.markdownPercent = bestTier.discountPercent;
      batch.markdownApplied = true;
      batch.salePrice = newSalePrice;
      await batch.save();

      // Log the event
      await MarkdownLog.create({
        ruleId: bestRule._id,
        batchId: batch._id,
        productId: batch.productId,
        warehouseId: batch.warehouseId,
        daysToExpiry,
        previousSalePrice: originalPrice,
        newSalePrice,
        discountPercent: bestTier.discountPercent,
        appliedAt: now,
      });

      result.updated++;
    } catch (err: any) {
      result.errors.push({ batchId: String(batch._id), reason: err?.message || 'Unknown error' });
    }
  }

  return result;
};

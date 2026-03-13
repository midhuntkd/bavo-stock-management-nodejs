export interface CreateStockDTO {
  productId: string;
  warehouseId: string;
  locationId?: string;
  quantity?: number;
  reservedQuantity?: number;
  damagedQuantity?: number;
  minStockLevel?: number;
  reorderLevel?: number;
  maxStockLevel?: number;
  lastPurchasePrice?: number;
  weightedAverageCost?: number;
}

export interface StockDeltaInput {
  quantityDelta?: number;
  reservedDelta?: number;
  damagedDelta?: number;
  lastPurchasePrice?: number;
  weightedAverageCost?: number;
}

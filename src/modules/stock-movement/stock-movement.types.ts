export interface CreateMovementDTO {
  stockId: string;
  batchId?: string;
  productId: string;
  warehouseId: string;
  locationId?: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RESERVE' | 'RELEASE' | 'RETURN_IN' | 'RETURN_OUT';
  movementType:
    | 'purchase'
    | 'sale'
    | 'inHouseSale'
    | 'warehouseTransfer'
    | 'damage'
    | 'replace'
    | 'expiry'
    | 'return'
    | 'manualAdjustment';
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
  amount?: number;
  gstAmount?: number;
  referenceType?: string;
  referenceId?: string;
  invoiceId?: string;
  purchaseOrderId?: string;
  grnId?: string;
  inHouseUser?: 'midhun' | 'shamshad' | 'faseeh' | 'staff';
  staffId?: string;
  priceType?: 'costPrice' | 'salePrice' | 'mrp' | 'actual';
  note?: string;
  balanceAfterMovement: number;
  createdBy?: string;
}

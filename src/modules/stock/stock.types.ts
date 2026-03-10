export interface CreateStockDTO {
  productName: string;
  hsnCode: string;
  barcode: string;
  salePrice: number;
  gst: number;
  mrp: number;
  actualPrice: number;
  imageUrl?: string;
  imageKey?: string;
  sku: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity?: number;
  minimumStockLevel?: number;
  unit: string;
  status?: 'active' | 'inactive';
}

export interface UpdateStockDTO {
  productName?: string;
  hsnCode?: string;
  barcode?: string;
  salePrice?: number;
  gst?: number;
  mrp?: number;
  actualPrice?: number;
  imageUrl?: string;
  imageKey?: string;
  unit?: string;
  minimumStockLevel?: number;
  status?: 'active' | 'inactive';
}

export interface StockOperationDTO {
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
}

export interface StockAdjustDTO extends StockOperationDTO {
  quantity: number;
}

export interface TransferStockDTO extends StockOperationDTO {
  sourceStockId: string;
  targetWarehouseId: string;
  quantity: number;
}

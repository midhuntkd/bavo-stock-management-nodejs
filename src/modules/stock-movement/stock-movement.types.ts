export interface CreateMovementDTO {
  stockId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RESERVE' | 'RELEASE';
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdBy?: string;
}

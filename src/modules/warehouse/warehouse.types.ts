export interface WarehouseCreateDTO {
  name: string;
  code: string;
  type: 'darkStore' | 'mainWarehouse' | 'miniWarehouse' | 'store';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contactName?: string;
  contactPhone?: string;
  serviceArea?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  openingTime?: string;
  closingTime?: string;
  isActive?: boolean;
}

export type WarehouseUpdateDTO = Partial<WarehouseCreateDTO> & { isActive?: boolean };

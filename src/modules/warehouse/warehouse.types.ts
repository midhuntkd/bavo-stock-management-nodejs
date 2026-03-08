export interface WarehouseCreateDTO {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contactName?: string;
  contactPhone?: string;
  status?: 'active' | 'inactive';
}

export interface WarehouseUpdateDTO extends Partial<WarehouseCreateDTO> {}

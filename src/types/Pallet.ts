export interface PalletItem {
  id: string;
  itemId: string;
  itemName: string;
  uom: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Pallet {
  id?: string;
  uuid?: string;
  palletCode: string;
  palletName: string;
  warehouseId: string;
  locationId?: string;
  items: PalletItem[];
  totalItems: number;
  status?: 'active' | 'inactive' | 'in-transit';
  createdAt?: string;
  updatedAt?: string;
}

export interface PalletFormData {
  palletCode: string;
  palletName: string;
  warehouseId: string;
  locationId?: string;
  items: PalletItem[];
  status?: 'active' | 'inactive';
}

export interface PalletListResponse {
  data: Pallet[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface AddPalletFormData {
  date: string;
  salesmanId: string;
  itemId: string;
  divisionId: string;
  warehouseId: string;
  qty: number | '';
  palletType: 'allocated' | 'return';
}

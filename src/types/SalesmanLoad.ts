export interface SalesmanLoadItem {
  id: string;
  itemId: string;
  itemName: string;
  uom: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SalesmanLoad {
  id?: string;
  uuid?: string;
  loadCode: string;
  salesmanId: string;
  vanId: string;
  warehouseId: string;
  loadDate: string;
  items: SalesmanLoadItem[];
  totalItems: number;
  totalValue: number;
  status?: 'pending' | 'loaded' | 'dispatched' | 'completed';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesmanLoadFormData {
  loadCode: string;
  salesmanId: string;
  vanId: string;
  warehouseId: string;
  loadDate: string;
  items: SalesmanLoadItem[];
  notes?: string;
  status?: 'pending' | 'loaded';
}

export interface SalesmanLoadListResponse {
  data: SalesmanLoad[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface SalesmanLoadItem {
  id: string;
  /** Present on a saved line; sent back so the line is kept rather than recreated. */
  uuid?: string;
  itemId: string;
  itemName: string;
  uom: string;
  quantity: number;
  requestedQty?: number;
  lowerQty?: number;
  ctnQty?: number;
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
  /** 1 = Delivery Load, 2 = Van Load. */
  loadType: number | '';
  routeId: string;
  salesmanId: string;
  loadDate: string;
  items: SalesmanLoadItem[];
}

export interface SalesmanLoadListResponse {
  data: SalesmanLoad[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

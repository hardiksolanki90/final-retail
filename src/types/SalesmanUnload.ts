export interface SalesmanUnloadItem {
  id: string;
  itemId: string;
  itemName: string;
  uom: string;
  quantity: number;
  unloadType: 'fresh' | 'damage' | 'expired';
  reasonId: string;
}

export interface SalesmanUnloadFormData {
  unloadNumber: string;
  routeId: string;
  warehouseId: string;
  vanId: string;
  salesmanId: string;
  transactionDate: string;
  items: SalesmanUnloadItem[];
}

export interface SalesmanUnload extends SalesmanUnloadFormData {
  id?: string;
  uuid?: string;
  routeName?: string;
  warehouseName?: string;
  vanCode?: string;
  salesmanName?: string;
  status?: boolean;
  approvalStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesmanUnloadListResponse {
  data: SalesmanUnload[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

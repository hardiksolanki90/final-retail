export interface GRNItem {
  id: string;
  itemId: string;
  itemName: string;
  uom: string;
  quantity: number;
  reason: string;
  returnReason: string;
}

export interface GRNFormData {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  grnNumber: string;
  grnDate: string;
  items: GRNItem[];
  remark: string;
}

export interface GRN extends GRNFormData {
  id?: string;
  uuid?: string;
  sourceWarehouseName?: string;
  destinationWarehouseName?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GRNListResponse {
  data: GRN[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

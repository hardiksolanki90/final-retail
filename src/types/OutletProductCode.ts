export interface OutletProductCode {
  id?: string;
  uuid?: string;
  code: string;
  productName: string;
  outletId: string;
  outletName: string;
  customerId: string;
  customerName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutletProductCodeFormData {
  code: string;
  productName: string;
  outletId: string;
  customerId: string;
}

export interface OutletProductCodeListResponse {
  data: OutletProductCode[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

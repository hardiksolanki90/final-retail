export interface Warehouse {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  address: string;
  city?: string;
  capacity?: number;
  contactPerson?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseFormData {
  code: string;
  name: string;
  address: string;
  city?: string;
  capacity?: number;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface WarehouseListResponse {
  data: Warehouse[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

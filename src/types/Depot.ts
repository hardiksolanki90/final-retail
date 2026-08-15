export interface Depot {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  address: string;
  city?: string;
  region?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepotFormData {
  code: string;
  name: string;
  address: string;
  city?: string;
  region?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface DepotListResponse {
  data: Depot[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

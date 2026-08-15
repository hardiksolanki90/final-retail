export interface Tax {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  rate: number;
  type?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxFormData {
  code: string;
  name: string;
  rate: number;
  type?: string;
  description?: string;
}

export interface TaxListResponse {
  data: Tax[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

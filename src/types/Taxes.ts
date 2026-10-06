export interface Tax {
  id?: string;
  uuid?: string;
  name: string;
  rate: number;
  type?: string;
  /** State / province code (India, Canada); empty = every region. */
  region?: string | null;
  isDefault?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxFormData {
  name: string;
  rate: number | '';
  type?: string;
  region?: string | null;
  isDefault?: boolean;
  description?: string;
}

export interface TaxListResponse {
  data: Tax[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface Reason {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  type?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReasonFormData {
  code: string;
  name: string;
  type?: string;
  description?: string;
}

export interface ReasonListResponse {
  data: Reason[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

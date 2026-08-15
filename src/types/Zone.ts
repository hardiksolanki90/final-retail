export interface Zone {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  regionId?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ZoneFormData {
  code: string;
  name: string;
  regionId?: string;
  description?: string;
}

export interface ZoneListResponse {
  data: Zone[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

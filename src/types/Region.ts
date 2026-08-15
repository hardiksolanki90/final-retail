export interface Region {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  countryId?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegionFormData {
  code: string;
  name: string;
  countryId?: string;
  description?: string;
}

export interface RegionListResponse {
  data: Region[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

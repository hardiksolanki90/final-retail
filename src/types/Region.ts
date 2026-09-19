export interface Region {
  id?: number;
  uuid?: string;
  countryId: number;
  regionCode: string;
  regionName: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegionFormData {
  countryId: number | '';
  regionCode: string;
  regionName: string;
  status: boolean;
}

export interface RegionListResponse {
  data: Region[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

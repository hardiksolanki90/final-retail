export interface Zone {
  id?: string;
  uuid?: string;
  zoneCode: string;
  name: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ZoneFormData {
  zoneCode: string;
  name: string;
  status: boolean;
}

export interface ZoneListResponse {
  data: Zone[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

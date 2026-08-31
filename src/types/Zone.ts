export interface Zone {
  id?: string;
  uuid?: string;
  name: string;
  noTruck: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ZoneFormData {
  name: string;
  noTruck: string;
  status: string;
}

export interface ZoneListResponse {
  data: Zone[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface Van {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  registrationNumber: string;
  capacity?: number;
  driverId?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  createdAt?: string;
  updatedAt?: string;
}

export interface VanFormData {
  code: string;
  name: string;
  registrationNumber: string;
  capacity?: number;
  driverId?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface VanListResponse {
  data: Van[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

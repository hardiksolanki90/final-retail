export interface Route {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  regionId?: string;
  areaId?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RouteFormData {
  code: string;
  name: string;
  regionId?: string;
  areaId?: string;
  description?: string;
}

export interface RouteListResponse {
  data: Route[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

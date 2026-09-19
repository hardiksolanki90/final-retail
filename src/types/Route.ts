export interface Route {
  id?: number;
  uuid?: string;
  code: string;
  name: string;
  areaId: number;
  depotId: number;
  status: boolean;
  area?: { id: number; uuid: string; code?: string; name: string } | null;
  depot?: { id: number; uuid: string; depotName: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RouteFormData {
  code: string;
  name: string;
  areaId: number | '';
  depotId: number | '';
  status: boolean;
}

export interface RouteListResponse {
  data: Route[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

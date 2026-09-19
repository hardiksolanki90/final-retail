export interface Depot {
  id?: number;
  uuid?: string;
  userId?: number | null;
  regionId: number;
  areaId?: number | null;
  depotCode: string;
  depotName: string;
  depotManager: string;
  depotManagerContact?: string;
  status: boolean;
  region?: { id: number; uuid: string; name: string } | null;
  area?: { id: number; uuid: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepotFormData {
  regionId: number | '';
  areaId?: number | '';
  depotCode: string;
  depotName: string;
  depotManager: string;
  depotManagerContact?: string;
  status: boolean;
}

export interface DepotListResponse {
  data: Depot[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

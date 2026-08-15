export interface Beat {
  id: number;
  code: string;
  name: string;
  salesmanId: number;
  areaId: number;
  routeId: number;
  workingDays: string[];
  description?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Relationships
  salesman?: {
    id: number;
    name: string;
    code: string;
  };
  area?: {
    id: number;
    name: string;
    code: string;
  };
  route?: {
    id: number;
    name: string;
    code: string;
  };
  outlets?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  outletCount?: number;
}

export interface BeatFormData {
  name: string;
  salesmanId: number;
  areaId: number;
  routeId: number;
  workingDays: string[];
  selectedOutlets: number[];
  description?: string;
  status?: boolean;
}

export interface BeatListResponse {
  data: Beat[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  nextPage?: number;
  prevPage?: number;
}

export interface Salesman {
  id: number;
  name: string;
  code: string;
}

export interface Area {
  id: number;
  name: string;
  code: string;
}

export interface Route {
  id: number;
  name: string;
  code: string;
  areaId: number;
}

export interface Outlet {
  id: number;
  name: string;
  code: string;
  routeId: number;
}
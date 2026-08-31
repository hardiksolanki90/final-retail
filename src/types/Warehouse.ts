export interface Warehouse {
  id: number;
  uuid: string;
  code: string;
  name: string;
  address?: string;
  manager?: string;
  isMain: boolean;
  locType?: string;
  lat?: string;
  lang?: string;
  depotId?: number;
  routeId?: number;
  parentWarehouseId?: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseFormData {
  code: string;
  name: string;
  address?: string;
  manager?: string;
  isMain?: boolean;
  locType?: string;
  lat?: string;
  lang?: string;
  depotId?: number;
  routeId?: number;
  parentWarehouseId?: number;
  status?: boolean;
}

export interface WarehouseListResponse {
  data: Warehouse[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
    next_page_url?: string;
    prev_page_url?: string;
  };
  message?: string;
}

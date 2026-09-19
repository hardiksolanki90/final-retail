// Area entity - maps to backend `areas` table (hierarchical lookup)
export interface Area {
  id?: number;
  uuid?: string;
  areaCode?: string;
  code?: string;
  areaName: string;
  name?: string; // alias of areaName from backend
  parentId?: number | null;
  nodeLevel?: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AreaFormData {
  areaCode?: string;
  areaName: string;
  parentId?: number | null;
  status?: boolean;
}

export interface AreaListResponse {
  data: Area[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages?: boolean;
  };
}

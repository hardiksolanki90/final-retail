// Beat/Area entity - maps to backend `areas` table (hierarchical lookup)
export interface Beat {
  id?: number;
  uuid?: string;
  areaName: string;
  name?: string; // alias of areaName from backend
  parentId?: string | null;
  nodeLevel?: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BeatFormData {
  areaName: string;
  parentId?: string | null;
  status?: boolean;
}

export interface BeatListResponse {
  data: Beat[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages?: boolean;
  };
}

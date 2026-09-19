// Beat entity - maps to backend `beats` table
export interface Beat {
  id?: number;
  uuid?: string;
  beatCode?: string;
  code?: string;
  beatName: string;
  name?: string; // alias of beatName from backend
  areaId?: number | null;
  area?: {
    id: number;
    uuid: string;
    code?: string;
    name?: string;
  } | null;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BeatFormData {
  beatCode?: string;
  beatName: string;
  areaId?: number | null;
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

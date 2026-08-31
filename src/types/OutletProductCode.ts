export interface OutletProductCode {
  id: number;
  uuid: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutletProductCodeFormData {
  name: string;
  code: string;
}

export interface OutletProductCodeListResponse {
  data: OutletProductCode[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
  message: string;
}

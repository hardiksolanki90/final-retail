export interface CreditLimit {
  id: number;
  uuid: string;
  userId: number;
  creditLimitType: 1 | 2;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface CreditLimitFormData {
  userId: number;
  creditLimitType: 1 | 2;
}

export interface CreditLimitListResponse {
  data: CreditLimit[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages?: boolean;
    next_page_url?: string | null;
    prev_page_url?: string | null;
  };
  message: string;
}

export interface CustomerCategory {
  id?: string;
  uuid?: string;
  categoryName: string;
  customerCategoryCode?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerCategoryFormData {
  categoryName: string;
  customerCategoryCode?: string;
  status: boolean;
}

export interface CustomerCategoryListResponse {
  data: CustomerCategory[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

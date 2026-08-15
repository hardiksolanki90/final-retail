export interface ItemGroup {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemGroupFormData {
  code: string;
  name: string;
  description?: string;
}

export interface ItemGroupListResponse {
  data: ItemGroup[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

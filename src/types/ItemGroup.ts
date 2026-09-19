export interface ItemGroup {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemGroupFormData {
  code: string;
  name: string;
  status: boolean;
}

export interface ItemGroupListResponse {
  data: ItemGroup[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

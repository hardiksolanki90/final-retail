export interface ItemUom {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemUomFormData {
  code: string;
  name: string;
}

export interface ItemUomListResponse {
  data: ItemUom[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

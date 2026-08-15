export interface Planogram {
  id?: string;
  uuid?: string;
  planogramCode: string;
  name: string;
  customerId: string;
  merchandiserId: string;
  category: string;
  description?: string;
  image?: string;
  shelfCount: number;
  productsPerShelf: number;
  date: string;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanogramFormData {
  planogramCode: string;
  name: string;
  customerId: string;
  merchandiserId: string;
  category: string;
  description?: string;
  image?: File | null;
  shelfCount: number;
  productsPerShelf: number;
  date: string;
  status?: 'active' | 'inactive';
}

export interface PlanogramListResponse {
  data: Planogram[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

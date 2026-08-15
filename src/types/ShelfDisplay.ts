export interface ShelfDisplay {
  id?: string;
  uuid?: string;
  displayCode: string;
  customerId: string;
  merchandiserId: string;
  date: string;
  category: string;
  brandId?: string;
  shelfPosition: string;
  facingCount: number;
  stockLevel: 'full' | 'partial' | 'empty';
  priceTagPresent: boolean;
  cleanlinessRating: number;
  image?: string;
  notes?: string;
  status?: 'completed' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

export interface ShelfDisplayFormData {
  displayCode: string;
  customerId: string;
  merchandiserId: string;
  date: string;
  category: string;
  brandId?: string;
  shelfPosition: string;
  facingCount: number;
  stockLevel: 'full' | 'partial' | 'empty';
  priceTagPresent: boolean;
  cleanlinessRating: number;
  image?: File | null;
  notes?: string;
}

export interface ShelfDisplayListResponse {
  data: ShelfDisplay[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

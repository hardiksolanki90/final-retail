export interface ShareOfShelf {
  id?: string;
  uuid?: string;
  code: string;
  customerId: string;
  customerName: string;
  merchandiserId: string;
  merchandiserName: string;
  date: string;
  category: string;
  brandName: string;
  totalShelfSpace: number;
  ownShelfSpace: number;
  sharePercentage: number;
  competitorShelfSpace: number;
  notes?: string;
  status?: 'completed' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

export interface ShareOfShelfListResponse {
  data: ShareOfShelf[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface CompetitorInfo {
  id: string;
  competitorName: string;
  competitorBrand: string;
  customerId: string;
  customerName: string;
  salesmanId: string;
  observationDate: string;
  productName: string;
  productCategory: string;
  price: number;
  promotionDetails?: string;
  displayType?: string;
  shelfSpace?: string;
  stockAvailability: 'in_stock' | 'out_of_stock' | 'low_stock';
  marketShare?: number;
  strengths?: string;
  weaknesses?: string;
  threats?: string;
  opportunities?: string;
  images?: string[];
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorInfoFormData {
  competitorName: string;
  competitorBrand: string;
  customerId: string;
  salesmanId: string;
  observationDate: string;
  productName: string;
  productCategory: string;
  price: number;
  promotionDetails?: string;
  displayType?: string;
  shelfSpace?: string;
  stockAvailability: 'in_stock' | 'out_of_stock' | 'low_stock';
  marketShare?: number;
  strengths?: string;
  weaknesses?: string;
  threats?: string;
  opportunities?: string;
  images?: string[];
  notes?: string;
  status: 'active' | 'inactive';
}

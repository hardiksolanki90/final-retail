export interface Campaign {
  id?: string;
  uuid?: string;
  campaignCode: string;
  type?: string;
  budget?: number | string;
  date?: string;
  startDate?: string;
  endDate?: string;
  salesmanId: string;
  customerId: string;
  feedback: string;
  image?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignFormData {
  campaignCode: string;
  type?: string;
  budget?: number | string;
  date?: string;
  startDate?: string;
  endDate?: string;
  salesmanId: string;
  customerId: string;
  feedback: string;
  image?: File | null;
  status?: 'active' | 'inactive';
}

export interface CampaignListResponse {
  data: Campaign[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

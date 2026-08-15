export interface Campaign {
  id?: string;
  uuid?: string;
  campaignCode: string;
  date: string;
  merchandiserId: string;
  customerId: string;
  feedback: string;
  image?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignFormData {
  campaignCode: string;
  date: string;
  merchandiserId: string;
  customerId: string;
  feedback: string;
  image?: File | null;
}

export interface CampaignListResponse {
  data: Campaign[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

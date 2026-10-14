import axiosInstance from '../lib/axios';

export interface CampaignRecord {
  id?: number | string;
  uuid?: string;
  campaign_id?: string;
  type?: string;
  budget?: number | string;
  salesman_id?: number | string;
  customer_id?: number | string;
  feedback?: string;
  trip_id?: number | string | null;
  date?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  created_at?: string;
  images?: string[];
  customer?: {
    id: number;
    uuid?: string;
    firstname: string;
    lastname: string;
    customer_code?: string;
    shop_name?: string;
    customerinfo?: { customer_code: string };
    email?: string;
    phone_number?: string;
    address?: string;
  };
  salesman?: {
    id: number;
    uuid?: string;
    firstname: string;
    lastname: string;
    name?: string;
    salesman_code?: string;
    salesmanCode?: string;
    salesmaninfo?: { salesman_code: string };
    email?: string;
    phone_number?: string;
  };
  campaign_picture_image?: Array<{
    id: number;
    image_string: string;
  }>;
}

export interface CampaignPayload {
  campaign_id: string;
  type?: string;
  budget?: number | string;
  salesman_id: number | string;
  customer_id: number | string;
  feedback: string;
  date?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  status?: string;
  images?: string[];
  image?: string;
}

export interface CampaignListResponse {
  data: CampaignRecord[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export const getCampaignList = async (page: number = 1, pageSize: number = 15, searchParams: Record<string, any> = {}): Promise<CampaignListResponse> => {
  const response = await axiosInstance.post('/campaign/list', {
    page,
    per_page: pageSize,
    page_size: pageSize,
    ...searchParams,
  });

  const payload = response.data;
  const list = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.campaigns)
    ? payload.campaigns
    : [];

  return {
    data: list,
    total: payload.total ?? payload.pagination?.total_records ?? list.length,
    currentPage: payload.currentPage ?? payload.pagination?.current_page ?? page,
    perPage: pageSize,
    lastPage: payload.lastPage ?? payload.pagination?.total_pages ?? 1,
  };
};

export const getCampaignDetails = async (uuidOrId: string | number): Promise<CampaignRecord> => {
  const response = await axiosInstance.get(`/campaign/edit/${uuidOrId}`);
  return response.data?.data ?? response.data;
};

export const createCampaign = async (payload: CampaignPayload) => {
  const response = await axiosInstance.post('/campaign/add', payload);
  return response.data;
};

export const updateCampaign = async (uuidOrId: string | number, payload: CampaignPayload) => {
  const response = await axiosInstance.post(`/campaign/edit/${uuidOrId}`, payload);
  return response.data;
};

export const deleteCampaign = async (uuidOrId: string | number) => {
  const response = await axiosInstance.delete(`/campaign/delete/${uuidOrId}`);
  return response.data;
};


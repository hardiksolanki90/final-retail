import axiosInstance from '../lib/axios';

export interface PlanogramRecord {
  id?: number | string;
  uuid?: string;
  planogram_id?: string;
  planogramCode?: string;
  name?: string;
  category?: string;
  description?: string;
  image?: string;
  shelf_count?: number;
  shelfCount?: number;
  products_per_shelf?: number;
  productsPerShelf?: number;
  date?: string;
  status?: string | number;
  created_at?: string;
  updated_at?: string;
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
    firstname?: string;
    lastname?: string;
    name?: string;
    salesman_code?: string;
    salesmaninfo?: { salesman_code: string };
    email?: string;
    phone_number?: string;
  };
  planogram_images?: Array<{
    id: number;
    image_string: string;
    image?: string;
  }>;
  images?: string[];
}

export interface PlanogramPayload {
  planogram_id?: string;
  name: string;
  customer_id: number | string;
  salesman_id: number | string;
  category?: string;
  description?: string;
  shelf_count?: number;
  products_per_shelf?: number;
  date?: string;
  status?: string;
  images?: string[];
}

export interface PlanogramListResponse {
  data: PlanogramRecord[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export const getPlanogramList = async (
  page: number = 1,
  pageSize: number = 15,
  searchParams: Record<string, any> = {}
): Promise<PlanogramListResponse> => {
  const response = await axiosInstance.post('/planogram/list', {
    page,
    per_page: pageSize,
    page_size: pageSize,
    ...searchParams,
  });

  const payload = response.data;
  const list = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.planograms)
    ? payload.planograms
    : [];

  return {
    data: list,
    total: payload.total ?? payload.pagination?.total_records ?? list.length,
    currentPage: payload.currentPage ?? payload.pagination?.current_page ?? page,
    perPage: pageSize,
    lastPage: payload.lastPage ?? payload.pagination?.total_pages ?? 1,
  };
};

export const getPlanogramDetails = async (uuidOrId: string | number): Promise<PlanogramRecord> => {
  const response = await axiosInstance.get(`/planogram/edit/${uuidOrId}`);
  return response.data?.data ?? response.data;
};

export const createPlanogram = async (payload: PlanogramPayload) => {
  const response = await axiosInstance.post('/planogram/add', payload);
  return response.data;
};

export const updatePlanogram = async (uuidOrId: string | number, payload: PlanogramPayload) => {
  const response = await axiosInstance.post(`/planogram/edit/${uuidOrId}`, payload);
  return response.data;
};

export const deletePlanogram = async (uuidOrId: string | number) => {
  const response = await axiosInstance.delete(`/planogram/delete/${uuidOrId}`);
  return response.data;
};

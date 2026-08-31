import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface OutletProductCodeListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getOutletProductCodeList = async (page = 1, perPage = 15, searchTerm?: string): Promise<OutletProductCodeListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/outlet-product-code/list?${params.toString()}`);
  return response.data;
};

export const createOutletProductCode = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/outlet-product-code/add', data);
  showToast.success('Outlet product code created successfully');
  return response.data;
};

export const updateOutletProductCode = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/outlet-product-code/edit/${uuid}`, data);
  showToast.success('Outlet product code updated successfully');
  return response.data;
};

export const deleteOutletProductCode = async (uuid: string) => {
  await axiosInstance.post('/outlet-product-code/delete', { id: uuid });
  showToast.success('Outlet product code deleted successfully');
};

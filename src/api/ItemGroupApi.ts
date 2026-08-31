import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface ItemGroupListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getItemGroupList = async (page = 1, perPage = 15, searchTerm?: string): Promise<ItemGroupListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/item-group/list?${params.toString()}`);
  return response.data;
};

export const createItemGroup = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/item-group/add', data);
  showToast.success('Item group created successfully');
  return response.data;
};

export const updateItemGroup = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/item-group/edit/${uuid}`, data);
  showToast.success('Item group updated successfully');
  return response.data;
};

export const deleteItemGroup = async (uuid: string) => {
  await axiosInstance.post('/item-group/delete', { id: uuid });
  showToast.success('Item group deleted successfully');
};

import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface ItemUomListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getItemUomList = async (page = 1, perPage = 15, searchTerm?: string): Promise<ItemUomListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/item-uom/list?${params.toString()}`);
  return response.data;
};

export const createItemUom = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/item-uom/add', data);
  showToast.success('UOM created successfully');
  return response.data;
};

export const updateItemUom = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/item-uom/edit/${uuid}`, data);
  showToast.success('UOM updated successfully');
  return response.data;
};

export const deleteItemUom = async (uuid: string) => {
  await axiosInstance.delete(`/item-uom/delete/${uuid}`);
  showToast.success('UOM deleted successfully');
};

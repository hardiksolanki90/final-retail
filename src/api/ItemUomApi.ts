import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type ItemUomListResponse = NormalizedListResponse<any>;

export const getItemUomList = async (page = 1, perPage = 15, searchTerm?: string): Promise<ItemUomListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/item-uom/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'itemUoms', perPage);
};

export const getAllItemUoms = async (): Promise<{ value: string; label: string }[]> => {
  const response = await axiosInstance.get('/item-uom/list?page=1&per_page=1000');
  const uoms = unwrapPaginated<{ id: number; uuid: string; code?: string; name?: string }>(response.data, 'itemUoms', 1000).data;
  return uoms.map((u) => ({ value: u.uuid ?? String(u.id), label: [u.code, u.name].filter(Boolean).join(' - ') }));
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

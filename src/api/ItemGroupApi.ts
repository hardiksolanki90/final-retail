import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type ItemGroupListResponse = NormalizedListResponse<any>;

export const getItemGroupList = async (page = 1, perPage = 15, searchTerm?: string): Promise<ItemGroupListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/item-group/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'itemGroups', perPage);
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

export const getItemGroupDetails = async (uuid: string): Promise<any> => {
  const response = await axiosInstance.get(`/item-group/view/${uuid}`);
  return response.data.data;
};

export const deleteItemGroup = async (uuid: string) => {
  await axiosInstance.delete(`/item-group/delete/${uuid}`);
  showToast.success('Item group deleted successfully');
};

export const getAllItemGroups = async (): Promise<{ value: string; label: string }[]> => {
  const response = await axiosInstance.get('/item-group/list?page=1&per_page=1000');
  const groups = unwrapPaginated<{ id: number; uuid: string; code?: string; name?: string }>(response.data, 'itemGroups', 1000).data;
  return groups.map((g) => ({ value: g.uuid ?? String(g.id), label: [g.code, g.name].filter(Boolean).join(' - ') }));
};

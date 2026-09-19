import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type VanListResponse = NormalizedListResponse<any>;

export const getVanList = async (page = 1, perPage = 15, searchTerm?: string): Promise<VanListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/van/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'vans', perPage);
};

export const createVan = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/van/add', data);
  showToast.success('Van created successfully');
  return response.data;
};

export const updateVan = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/van/edit/${uuid}`, data);
  showToast.success('Van updated successfully');
  return response.data;
};

export const deleteVan = async (uuid: string) => {
  await axiosInstance.delete(`/van/delete/${uuid}`);
  showToast.success('Van deleted successfully');
};

export interface VanOption { value: number; label: string; }

export const getVanOptions = async (): Promise<VanOption[]> => {
  const response = await axiosInstance.get('/van/all?per_page=50');
  const data = response.data?.vans ?? [];
  return data.map((v: { id: number; vanCode?: string; plateNumber?: string }) => ({
    value: v.id,
    label: `${v.vanCode || ''} - ${v.plateNumber || ''}`.replace(/^ - | - $/g, ''),
  }));
};

export interface VanTypeOption { value: number; label: string; }

// Van Master is a compound entity (vans + van_types + van_categories) —
// these feed the Van Add form's relationship dropdowns.
export const getVanTypeOptions = async (): Promise<VanTypeOption[]> => {
  const response = await axiosInstance.get('/van-type/all?per_page=50');
  const data = response.data?.vanTypes ?? [];
  return data.map((t: { id: number; name?: string }) => ({ value: t.id, label: t.name ?? String(t.id) }));
};

export const createVanType = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/van-type/add', data);
  showToast.success('Van type created successfully');
  return response.data;
};

export interface VanCategoryOption { value: number; label: string; }

export const getVanCategoryOptions = async (): Promise<VanCategoryOption[]> => {
  const response = await axiosInstance.get('/van-category/all?per_page=50');
  const data = response.data?.vanCategories ?? [];
  return data.map((c: { id: number; name?: string }) => ({ value: c.id, label: c.name ?? String(c.id) }));
};

export const createVanCategory = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/van-category/add', data);
  showToast.success('Van category created successfully');
  return response.data;
};

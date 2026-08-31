import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { WarehouseListResponse, WarehouseFormData } from '../types/Warehouse';

export const getWarehouseList = async (
  page = 1,
  perPage = 15,
  searchTerm?: string,
  depotId?: number,
  routeId?: number,
  status?: boolean
): Promise<WarehouseListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  if (depotId) params.append('depot_id', depotId.toString());
  if (routeId) params.append('route_id', routeId.toString());
  if (status !== undefined) params.append('status', status ? '1' : '0');
  const response = await axiosInstance.get(`/warehouse/list?${params.toString()}`);
  return response.data;
};

export const getWarehouseAll = async () => {
  const response = await axiosInstance.get('/warehouse/all');
  return response.data;
};

export const getWarehouseByUuid = async (uuid: string) => {
  const response = await axiosInstance.get(`/warehouse/edit/${uuid}`);
  return response.data;
};

export const createWarehouse = async (data: WarehouseFormData) => {
  const response = await axiosInstance.post('/warehouse/add', data);
  showToast.success('Warehouse created successfully');
  return response.data;
};

export const updateWarehouse = async (uuid: string, data: WarehouseFormData) => {
  const response = await axiosInstance.post(`/warehouse/edit/${uuid}`, data);
  showToast.success('Warehouse updated successfully');
  return response.data;
};

export const deleteWarehouse = async (uuid: string) => {
  await axiosInstance.delete(`/warehouse/delete/${uuid}`);
  showToast.success('Warehouse deleted successfully');
};

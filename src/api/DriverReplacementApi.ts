import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { DriverReplacementFormData } from '../types/DriverReplacement';

export interface DriverReplacementListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
}

export interface DriverReplacementFilters {
  old_salesman_id?: number;
  new_salesman_id?: number;
  reason_id?: number;
}

export const getDriverReplacementList = async (
  page = 1,
  perPage = 15,
  filters?: DriverReplacementFilters
): Promise<DriverReplacementListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (filters?.old_salesman_id) params.append('old_salesman_id', filters.old_salesman_id.toString());
  if (filters?.new_salesman_id) params.append('new_salesman_id', filters.new_salesman_id.toString());
  if (filters?.reason_id) params.append('reason_id', filters.reason_id.toString());
  const response = await axiosInstance.get(`/driver-replacement/list?${params.toString()}`);
  return response.data;
};

export const createDriverReplacement = async (data: DriverReplacementFormData) => {
  const response = await axiosInstance.post('/driver-replacement/add', data);
  showToast.success('Driver replacement created successfully');
  return response.data;
};

export const updateDriverReplacement = async (uuid: string, data: DriverReplacementFormData) => {
  const response = await axiosInstance.post(`/driver-replacement/edit/${uuid}`, data);
  showToast.success('Driver replacement updated successfully');
  return response.data;
};

export const deleteDriverReplacement = async (uuid: string) => {
  await axiosInstance.delete(`/driver-replacement/delete/${uuid}`);
  showToast.success('Driver replacement deleted successfully');
};

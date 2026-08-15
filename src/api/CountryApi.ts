import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface CountryListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getCountryList = async (page = 1, perPage = 15, searchTerm?: string): Promise<CountryListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/country/list?${params.toString()}`);
  return response.data;
};

export const createCountry = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/country/add', data);
  showToast.success('Country created successfully');
  return response.data;
};

export const updateCountry = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/country/edit/${uuid}`, data);
  showToast.success('Country updated successfully');
  return response.data;
};

export const deleteCountry = async (uuid: string) => {
  await axiosInstance.delete(`/country/delete/${uuid}`);
  showToast.success('Country deleted successfully');
};

import axiosInstance from '../lib/axios';
import { unwrapPaginated } from '../lib/paginatedResponse';

export interface Division {
  id: number;
  uuid: string;
  code: string | null;
  name: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DivisionFormData {
  code?: string;
  name: string;
  status?: boolean;
}

export interface DivisionSelectOption {
  value: string;
  label: string;
}

export const getDivisionList = async (page = 1, perPage = 15, searchTerm?: string) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/division/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'divisions', perPage);
};

export const getAllDivisions = async (): Promise<DivisionSelectOption[]> => {
  const response = await axiosInstance.get('/division/all');
  return response.data.data ?? [];
};

export const createDivision = async (data: DivisionFormData): Promise<Division> => {
  const response = await axiosInstance.post('/division/add', data);
  return response.data.data;
};

export const updateDivision = async (uuid: string, data: DivisionFormData): Promise<Division> => {
  const response = await axiosInstance.post(`/division/edit/${uuid}`, data);
  return response.data.data;
};

export const deleteDivision = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/division/delete', { id: uuid });
};

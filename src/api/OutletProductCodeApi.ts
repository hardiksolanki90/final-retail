import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type OutletProductCodeListResponse = NormalizedListResponse<any>;

export const getOutletProductCodeList = async (page = 1, perPage = 15, searchTerm?: string): Promise<OutletProductCodeListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/outlet-product-code/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'outletProductCodes', perPage);
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
  await axiosInstance.delete(`/outlet-product-code/delete/${uuid}`);
  showToast.success('Outlet product code deleted successfully');
};

import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { CreditLimitFormData, CreditLimitListResponse } from '../types/CreditLimit';

export const getCreditLimitList = async (page = 1, perPage = 15): Promise<CreditLimitListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  const response = await axiosInstance.get(`/user-credit-limit/list?${params.toString()}`);
  return response.data;
};

export const createCreditLimit = async (data: CreditLimitFormData) => {
  const response = await axiosInstance.post('/user-credit-limit/add', data);
  showToast.success('Credit limit created successfully');
  return response.data;
};

export const updateCreditLimit = async (uuid: string, data: CreditLimitFormData) => {
  const response = await axiosInstance.post(`/user-credit-limit/edit/${uuid}`, data);
  showToast.success('Credit limit updated successfully');
  return response.data;
};

export const deleteCreditLimit = async (uuid: string) => {
  await axiosInstance.post('/user-credit-limit/delete', { id: uuid });
  showToast.success('Credit limit deleted successfully');
};

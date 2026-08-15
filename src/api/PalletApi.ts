import axiosInstance from '../lib/axios';
import type { AddPalletFormData, PalletListResponse } from '../types/Pallet';

export const getPalletList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15
): Promise<PalletListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (searchTerm) {
    params.append('search', searchTerm);
  }

  const response = await axiosInstance.get(`/pallets?${params.toString()}`);
  return response.data;
};

export const createPallet = async (data: AddPalletFormData): Promise<unknown> => {
  const response = await axiosInstance.post('/pallets', data);
  return response.data.data || response.data;
};

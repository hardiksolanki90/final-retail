import axiosInstance from '../lib/axios';
import type { AddPalletFormData, PalletSummaryListResponse } from '../types/Pallet';

export const getPalletList = async (
  page: number = 1,
  perPage: number = 15
): Promise<PalletSummaryListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  const response = await axiosInstance.get(`/pallet/list?${params.toString()}`);
  const payload = response.data;

  return {
    data: payload.pallets ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
};

export const createPallet = async (data: AddPalletFormData): Promise<unknown> => {
  const response = await axiosInstance.post('/pallet/add', data);
  return response.data.data;
};

import axiosInstance from '../lib/axios';
import type { PdpPromotion, PdpPromotionLine, PdpResolution, PdpResolveParams } from '../types/PdpResolution';

export const resolvePdp = async (params: PdpResolveParams): Promise<PdpResolution> => {
  const response = await axiosInstance.post('/pdp/resolve', params);
  return response.data.data;
};

export const resolvePdpPromotions = async (params: { customerId: string; lines: PdpPromotionLine[] }): Promise<PdpPromotion[]> => {
  const response = await axiosInstance.post('/pdp/resolve-promotions', params);
  return response.data.data;
};

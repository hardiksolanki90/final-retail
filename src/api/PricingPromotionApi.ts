import axiosInstance from '../lib/axios';
import type { PricingPromotionRule, RuleFormData, RuleListResponse, RuleType } from '../types/PricingPromoDiscount';

/**
 * Pricing, Promotion and Discount are one shared backend table/repository,
 * discriminated by `type` — this factory avoids tripling identical CRUD
 * boilerplate across the 3 route prefixes (/pricing, /promotion, /discount).
 */
export function createRuleApi(prefix: RuleType) {
  const getList = async (
    page: number = 1,
    searchTerm?: string,
    perPage: number = 15,
  ): Promise<RuleListResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    if (searchTerm) params.append('search', searchTerm);

    const response = await axiosInstance.get(`/${prefix}/list?${params.toString()}`);
    const payload = response.data;

    return {
      data: payload.rules ?? [],
      total: payload.total ?? 0,
      currentPage: payload.currentPage ?? page,
      perPage,
      lastPage: payload.lastPage ?? 1,
    };
  };

  const getByUuid = async (uuid: string): Promise<PricingPromotionRule> => {
    const response = await axiosInstance.get(`/${prefix}/edit/${uuid}`);
    return response.data.data;
  };

  const create = async (data: RuleFormData): Promise<PricingPromotionRule> => {
    const response = await axiosInstance.post(`/${prefix}/add`, data);
    return response.data.data;
  };

  const update = async (uuid: string, data: RuleFormData): Promise<PricingPromotionRule> => {
    const response = await axiosInstance.post(`/${prefix}/edit/${uuid}`, data);
    return response.data.data;
  };

  const remove = async (uuid: string): Promise<void> => {
    await axiosInstance.post(`/${prefix}/delete`, { id: uuid });
  };

  const bulkAction = async (
    uuids: string[],
    action: 'activate' | 'deactivate' | 'delete',
  ): Promise<void> => {
    await axiosInstance.post(`/${prefix}/bulk-action`, { uuids, action });
  };

  return { getList, getByUuid, create, update, remove, bulkAction };
}

export const pricingApi = createRuleApi('pricing');
export const promotionApi = createRuleApi('promotion');
export const discountApi = createRuleApi('discount');

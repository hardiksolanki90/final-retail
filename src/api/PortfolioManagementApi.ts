import axiosInstance from '../lib/axios';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';
import type {
  PortfolioManagement,
  PortfolioManagementDetail,
  PortfolioManagementListParams,
  PortfolioManagementPayload,
} from '../types/PortfolioManagement';

export const getPortfolioManagements = async ({
  page = 1,
  perPage = 15,
  search,
  customerId,
  status,
  startDate,
  endDate,
}: PortfolioManagementListParams): Promise<NormalizedListResponse<PortfolioManagement>> => {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (search) params.append('search', search);
  if (customerId) params.append('customer_id', String(customerId));
  if (status !== undefined) params.append('status', status ? '1' : '0');
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  return unwrapPaginated<PortfolioManagement>(
    (await axiosInstance.get(`/portfolio-management/list?${params.toString()}`)).data,
    'portfolioManagements',
    perPage
  );
};

export const getPortfolioManagement = async (uuid: string): Promise<PortfolioManagementDetail> =>
  (await axiosInstance.get(`/portfolio-management/edit/${uuid}`)).data.data;

export const createPortfolioManagement = async (
  payload: PortfolioManagementPayload
): Promise<PortfolioManagementDetail> =>
  (await axiosInstance.post('/portfolio-management/add', payload)).data.data;

export const updatePortfolioManagement = async (
  uuid: string,
  payload: PortfolioManagementPayload
): Promise<PortfolioManagementDetail> =>
  (await axiosInstance.post(`/portfolio-management/edit/${uuid}`, payload)).data.data;

export const deletePortfolioManagement = async (uuid: string) =>
  (await axiosInstance.delete(`/portfolio-management/delete/${uuid}`)).data;

export const deletePortfolioManagements = async (ids: string[]) =>
  (await axiosInstance.post('/portfolio-management/delete', { ids })).data;

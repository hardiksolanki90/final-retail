import axiosInstance from '../lib/axios';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';
import type { RouteItemGrouping, RouteItemGroupingDetail, RouteItemGroupingListParams, RouteItemGroupingPayload } from '../types/RouteItemGrouping';

export const getRouteItemGroupings = async ({ page = 1, perPage = 15, search, routeId, salesmanId, status }: RouteItemGroupingListParams): Promise<NormalizedListResponse<RouteItemGrouping>> => {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (search) params.append('search', search);
  if (routeId) params.append('route_id', String(routeId));
  if (salesmanId) params.append('salesman_id', String(salesmanId));
  if (status !== undefined) params.append('status', status ? '1' : '0');
  return unwrapPaginated<RouteItemGrouping>((await axiosInstance.get(`/route-item-grouping/list?${params.toString()}`)).data, 'routeItemGroupings', perPage);
};

export const getRouteItemGrouping = async (uuid: string): Promise<RouteItemGroupingDetail> => (await axiosInstance.get(`/route-item-grouping/edit/${uuid}`)).data.data;

export const createRouteItemGrouping = async (payload: RouteItemGroupingPayload): Promise<RouteItemGroupingDetail> => (await axiosInstance.post('/route-item-grouping/add', payload)).data.data;

export const updateRouteItemGrouping = async (uuid: string, payload: RouteItemGroupingPayload): Promise<RouteItemGroupingDetail> => (await axiosInstance.post(`/route-item-grouping/edit/${uuid}`, payload)).data.data;

export const deleteRouteItemGrouping = async (uuid: string) => (await axiosInstance.delete(`/route-item-grouping/delete/${uuid}`)).data;

/** Bulk delete: `ids` are group uuids. */
export const deleteRouteItemGroupings = async (ids: string[]) => (await axiosInstance.post('/route-item-grouping/delete', { ids })).data;

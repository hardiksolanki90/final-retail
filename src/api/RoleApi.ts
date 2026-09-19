import axiosInstance from '../lib/axios';
import type { UserRole, UserRoleFormData, UserRoleListResponse } from '../types/UsersRoles';

export const getRoleList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
): Promise<UserRoleListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/role/list?${params.toString()}`);
  const payload = response.data;

  return {
    data: payload.roles ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
};

export const createRole = async (data: UserRoleFormData): Promise<UserRole> => {
  const response = await axiosInstance.post('/role/add', data);
  return response.data.data;
};

export const updateRole = async (uuid: string, data: UserRoleFormData): Promise<UserRole> => {
  const response = await axiosInstance.post(`/role/edit/${uuid}`, data);
  return response.data.data;
};

export const deleteRole = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/role/delete', { id: uuid });
};

export const bulkActionRoles = async (
  uuids: string[],
  action: 'activate' | 'deactivate' | 'delete',
): Promise<void> => {
  await axiosInstance.post('/role/bulk-action', { uuids, action });
};

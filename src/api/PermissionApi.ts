import axiosInstance from '../lib/axios';
import type { PermissionOption } from '../types/UsersRoles';

export const getAllPermissions = async (): Promise<PermissionOption[]> => {
  const response = await axiosInstance.get('/permission/all');
  return response.data.data ?? [];
};

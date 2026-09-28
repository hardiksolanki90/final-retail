import axiosInstance from '../lib/axios';
import type { InviteUser, InviteUserFormData, InviteUserListResponse } from '../types/InviteUser';

export const getInviteUserList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
): Promise<InviteUserListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/invite-user/list?${params.toString()}`);
  const payload = response.data;

  return {
    data: payload.users ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
};

export const getInviteUserByUuid = async (uuid: string): Promise<InviteUser> => {
  const response = await axiosInstance.get(`/invite-user/edit/${uuid}`);
  return response.data.data;
};

export const createInviteUser = async (data: InviteUserFormData): Promise<InviteUser> => {
  const response = await axiosInstance.post('/invite-user/add', data);
  return response.data.data;
};

export const updateInviteUser = async (uuid: string, data: InviteUserFormData): Promise<InviteUser> => {
  const response = await axiosInstance.post(`/invite-user/edit/${uuid}`, data);
  return response.data.data;
};

export const deleteInviteUser = async (uuid: string): Promise<void> => {
  await axiosInstance.delete(`/invite-user/delete/${uuid}`);
};

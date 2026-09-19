import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { WorkFlowRule, WorkFlowRuleFormData, WorkFlowRuleListResponse } from '../types/WorkFlowRule';

export const getWorkFlowRuleList = async (
  page: number = 1,
  perPage: number = 15,
  searchTerm?: string
): Promise<WorkFlowRuleListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/work-flow/list?${params.toString()}`);
  const payload = response.data;

  return {
    data: payload.workFlowRules ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
};

export const getWorkFlowRuleDetails = async (uuid: string): Promise<WorkFlowRule> => {
  const response = await axiosInstance.get(`/work-flow/edit/${uuid}`);
  return response.data.data;
};

export const createWorkFlowRule = async (data: WorkFlowRuleFormData): Promise<WorkFlowRule> => {
  const response = await axiosInstance.post('/work-flow/add', data);
  showToast.success('Work flow rule created successfully');
  return response.data.data;
};

export const updateWorkFlowRule = async (uuid: string, data: WorkFlowRuleFormData): Promise<WorkFlowRule> => {
  const response = await axiosInstance.post(`/work-flow/edit/${uuid}`, data);
  showToast.success('Work flow rule updated successfully');
  return response.data.data;
};

export const deleteWorkFlowRule = async (uuid: string): Promise<void> => {
  await axiosInstance.delete(`/work-flow/delete/${uuid}`);
  showToast.success('Work flow rule deleted successfully');
};

export interface ApproverOption { value: number; label: string; }

export const getApproverOptions = async (): Promise<ApproverOption[]> => {
  const response = await axiosInstance.get('/work-flow/approver-options');
  return response.data?.data ?? [];
};

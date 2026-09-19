import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkFlowRuleList,
  createWorkFlowRule,
  updateWorkFlowRule,
  deleteWorkFlowRule,
  getApproverOptions,
} from '../../api/WorkFlowApi';
import { getRoleList } from '../../api/RoleApi';
import { showToast } from '../../lib/toast';
import type { WorkFlowRuleFormData } from '../../types/WorkFlowRule';

export function useWorkFlowRules(page: number = 1, searchTerm: string = '') {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['work-flow-rules', page, searchTerm],
    queryFn: () => getWorkFlowRuleList(page, 15, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkFlowRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-flow-rules'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to delete work flow rule');
    },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this work flow rule?')) {
      deleteMutation.mutate(uuid);
    }
  };

  return {
    rules: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    lastPage: listQuery.data?.lastPage ?? 1,
    isLoading: listQuery.isLoading,
    handleDeleteWithConfirmation,
  };
}

export function useWorkFlowRuleMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: WorkFlowRuleFormData) => createWorkFlowRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-flow-rules'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to create work flow rule');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: WorkFlowRuleFormData }) => updateWorkFlowRule(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-flow-rules'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update work flow rule');
    },
  });

  return { createMutation, updateMutation };
}

export function useWorkFlowFormOptions() {
  const rolesQuery = useQuery({
    queryKey: ['role-options-workflow'],
    queryFn: () => getRoleList(1, undefined, 100),
    staleTime: 5 * 60 * 1000,
  });

  const approversQuery = useQuery({
    queryKey: ['approver-options'],
    queryFn: () => getApproverOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const roleOptions = (rolesQuery.data?.data ?? []).map((role) => ({
    value: String(role.id),
    label: role.name,
  }));

  const approverOptions = (approversQuery.data ?? []).map((approver) => ({
    value: String(approver.value),
    label: approver.label,
  }));

  return {
    roleOptions,
    approverOptions,
    isLoading: rolesQuery.isLoading || approversQuery.isLoading,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoleList, createRole, updateRole, bulkActionRoles } from '../../api/RoleApi';
import { getAllPermissions } from '../../api/PermissionApi';
import { showToast } from '../../lib/toast';
import type { UserRoleFormData } from '../../types/UsersRoles';

export function useRoles(page: number = 1, searchTerm: string = '') {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['roles', page, searchTerm],
    queryFn: () => getRoleList(page, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) =>
      bulkActionRoles(uuids, action),
    onSuccess: () => {
      showToast.success('Roles updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update roles');
    },
  });

  return {
    roles: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    bulkAction: bulkActionMutation.mutate,
  };
}

export function usePermissionCatalog() {
  const query = useQuery({
    queryKey: ['permission-catalog'],
    queryFn: () => getAllPermissions(),
    staleTime: 10 * 60 * 1000,
  });

  return {
    permissions: query.data ?? [],
    isLoading: query.isLoading,
  };
}

export function useRoleMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: UserRoleFormData) => createRole(data),
    onSuccess: () => {
      showToast.success('Role created successfully!');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to create role');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UserRoleFormData }) => updateRole(uuid, data),
    onSuccess: () => {
      showToast.success('Role updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  return { createMutation, updateMutation };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateEntity } from '../useEntityDetail';
import { getInviteUserList, createInviteUser, updateInviteUser, deleteInviteUser } from '../../api/InviteUserApi';
import { showToast } from '../../lib/toast';
import type { InviteUserFormData } from '../../types/InviteUser';

export function useInviteUsers(page: number = 1, searchTerm: string = '') {
    const queryClient = useQueryClient();

    const listQuery = useQuery({ queryKey: ['invite-users', page, searchTerm], queryFn: () => getInviteUserList(page, searchTerm), staleTime: 2 * 60 * 1000 });

    const deleteMutation = useMutation({
        mutationFn: (uuid: string) => deleteInviteUser(uuid),
        onSuccess: () => {
            showToast.success('User deleted successfully!');
            invalidateEntity(queryClient, 'invite-users', 'invite-user');
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to delete user');
        },
    });

    return {
        users: listQuery.data?.data ?? [],
        total: listQuery.data?.total ?? 0,
        currentPage: listQuery.data?.currentPage ?? page,
        lastPage: listQuery.data?.lastPage ?? 1,
        isLoading: listQuery.isLoading,
        deleteUser: deleteMutation.mutate,
    };
}

export function useInviteUserMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: InviteUserFormData) => createInviteUser(data),
        onSuccess: () => {
            showToast.success('User invited successfully!');
            invalidateEntity(queryClient, 'invite-users', 'invite-user');
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to invite user');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ uuid, data }: { uuid: string; data: InviteUserFormData }) => updateInviteUser(uuid, data),
        onSuccess: () => {
            showToast.success('User updated successfully!');
            invalidateEntity(queryClient, 'invite-users', 'invite-user');
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to update user');
        },
    });

    return { createMutation, updateMutation };
}

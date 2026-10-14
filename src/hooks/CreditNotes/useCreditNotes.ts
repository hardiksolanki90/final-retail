import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCreditNoteList, bulkActionCreditNotes } from '../../api/CreditNoteApi';
import { showToast } from '../../lib/toast';

export function useCreditNotes(page: number = 1, searchTerm: string = '') {
    const queryClient = useQueryClient();

    const listQuery = useQuery({ queryKey: ['credit-notes', page, searchTerm], queryFn: () => getCreditNoteList(page, searchTerm), staleTime: 2 * 60 * 1000 });

    const bulkActionMutation = useMutation({
        mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) => bulkActionCreditNotes(uuids, action),
        onSuccess: () => {
            showToast.success('Credit notes updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            showToast.error(error.response?.data?.message || 'Failed to update credit notes');
        },
    });

    return {
        creditNotes: listQuery.data?.data ?? [],
        total: listQuery.data?.total ?? 0,
        currentPage: listQuery.data?.currentPage ?? page,
        lastPage: listQuery.data?.lastPage ?? 1,
        isLoading: listQuery.isLoading,
        error: listQuery.error,
        refetch: listQuery.refetch,
        bulkAction: bulkActionMutation.mutate,
        isBulkActing: bulkActionMutation.isPending,
    };
}

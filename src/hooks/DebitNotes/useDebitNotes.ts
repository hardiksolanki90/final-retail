import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bulkActionDebitNotes, getDebitNoteList } from '../../api/DebitNoteApi';
import { showToast } from '../../lib/toast';

export function useDebitNotes(page: number = 1, searchTerm: string = '') {
    const queryClient = useQueryClient();

    const listQuery = useQuery({ queryKey: ['debit-notes', page, searchTerm], queryFn: () => getDebitNoteList(page, searchTerm), staleTime: 2 * 60 * 1000 });

    const bulkActionMutation = useMutation({
        mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) => bulkActionDebitNotes(uuids, action),
        onSuccess: () => {
            showToast.success('Debit notes updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            showToast.error(error.response?.data?.message || 'Failed to update debit notes');
        },
    });

    return { debitNotes: listQuery.data?.data ?? [], total: listQuery.data?.total ?? 0, isLoading: listQuery.isLoading, bulkAction: bulkActionMutation.mutate };
}

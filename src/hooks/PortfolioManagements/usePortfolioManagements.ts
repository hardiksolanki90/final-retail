import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPortfolioManagement,
  deletePortfolioManagement,
  deletePortfolioManagements,
  getPortfolioManagement,
  getPortfolioManagements,
  updatePortfolioManagement,
} from '../../api/PortfolioManagementApi';
import { showToast } from '../../lib/toast';
import type {
  PortfolioManagementListParams,
  PortfolioManagementPayload,
} from '../../types/PortfolioManagement';

const LIST_KEY = 'portfolio-managements';
const DETAIL_KEY = 'portfolio-management-detail';

type ApiError = { response?: { data?: { message?: string } } };
const errorToast = (fallback: string) => (error: ApiError) =>
  showToast.error(error.response?.data?.message || fallback);

/** One page of portfolios; previous page stays on screen while next loads */
export function usePortfolioManagements(params: PortfolioManagementListParams) {
  return useQuery({
    queryKey: [LIST_KEY, params],
    queryFn: () => getPortfolioManagements(params),
    placeholderData: keepPreviousData,
  });
}

/** One portfolio with its customers & items */
export function usePortfolioManagement(uuid: string | null) {
  return useQuery({
    queryKey: [DETAIL_KEY, uuid],
    queryFn: () => getPortfolioManagement(uuid as string),
    enabled: Boolean(uuid),
  });
}

function useRefresh() {
  const queryClient = useQueryClient();
  return () =>
    [LIST_KEY, DETAIL_KEY].forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
}

export function usePortfolioManagementActions() {
  const refresh = useRefresh();
  const done = (message: string) => () => {
    showToast.success(message);
    refresh();
  };
  return {
    create: useMutation({
      mutationFn: (payload: PortfolioManagementPayload) => createPortfolioManagement(payload),
      onSuccess: done('Portfolio created successfully'),
      onError: errorToast('Failed to create portfolio'),
    }),
    update: useMutation({
      mutationFn: ({ uuid, payload }: { uuid: string; payload: PortfolioManagementPayload }) =>
        updatePortfolioManagement(uuid, payload),
      onSuccess: done('Portfolio updated successfully'),
      onError: errorToast('Failed to update portfolio'),
    }),
    remove: useMutation({
      mutationFn: deletePortfolioManagement,
      onSuccess: done('Portfolio deleted successfully'),
      onError: errorToast('Failed to delete portfolio'),
    }),
    removeMany: useMutation({
      mutationFn: deletePortfolioManagements,
      onSuccess: done('Portfolios deleted successfully'),
      onError: errorToast('Failed to delete portfolios'),
    }),
  };
}

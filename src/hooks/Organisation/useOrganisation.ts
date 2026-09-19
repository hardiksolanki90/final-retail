import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentOrganisation, updateOrganisation } from '../../api/OrganisationApi';
import type { OrganisationFormData } from '../../types/Organisation';

// Session-scoped (one org per user) — cached under a single query key so
// View/Add/Edit share one fetch instead of each page hitting the API on
// every mount. Default staleTime (5 min, set in lib/queryClient) means
// navigating between those pages within that window serves cache, no request.
export function useOrganisation() {
  const query = useQuery({
    queryKey: ['organisation', 'current'],
    queryFn: getCurrentOrganisation,
  });

  return {
    organisation: query.data ?? null,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUpdateOrganisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganisationFormData) => updateOrganisation(data),
    onSuccess: () => {
      // Refetch rather than trust the response shape blindly — keeps View/Add/Edit
      // in sync with whatever the next page reads from the cache.
      queryClient.invalidateQueries({ queryKey: ['organisation'] });
    },
  });
}

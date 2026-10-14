import { MutationCache, QueryClient } from '@tanstack/react-query';
import { invalidateRecordViews } from './recordCache';
import { isAxiosError } from 'axios';

/** Retry only what can fix itself: network failures (no response) and 5xx. A 4xx (403, 404, 422…) will answer the same way again. */
export const retryTransient = (maxRetries: number) => (failureCount: number, error: unknown) => failureCount < maxRetries && (!isAxiosError(error) || !error.response || error.response.status >= 500);

export const queryClient: QueryClient = new QueryClient({
    // Any successful write makes the record views' lists and extra details stale; only the ones on screen refetch.
    mutationCache: new MutationCache({ onSuccess: () => void invalidateRecordViews(queryClient) }),
    defaultOptions: {
        queries: {
            retry: retryTransient(2),
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
        // Writes (create/update/delete) must never be replayed automatically: a failed POST (422 included) is reported once and the user decides.
        mutations: { retry: false },
    },
});

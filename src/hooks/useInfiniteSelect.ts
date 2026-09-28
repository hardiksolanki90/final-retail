import { useState, useEffect, useCallback, useRef } from 'react';
import type { SelectOption } from '../components/ui/Select';

export interface UseInfiniteSelectProps<T> {
  fetchPage: (page: number, search: string) => Promise<{
    items: T[];
    hasMore: boolean;
  }>;
  mapItemToOption: (item: T) => SelectOption;
  selectedValue?: string | number;
  /**
   * Gate the initial fetch — for a Select that lives inside a modal/drawer
   * still mounted (just hidden) while closed, so it doesn't fire a request
   * before the user ever opens it. Defaults to true (fetch on mount, the
   * original behavior). Refetches page 1 whenever it flips false -> true.
   */
  enabled?: boolean;
  /**
   * Forces a fresh page-1 fetch whenever this value changes (in addition to
   * the enabled false->true trigger) — for a filter parameter baked into
   * `fetchPage`'s closure (e.g. a salesmanId) that can change while the
   * component stays mounted and enabled, which `fetchPage` changing alone
   * doesn't trigger a refetch for.
   */
  resetKey?: string | number;
}

export function useInfiniteSelect<T>({
  fetchPage,
  mapItemToOption,
  selectedValue,
  enabled = true,
  resetKey,
}: UseInfiniteSelectProps<T>) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // References to keep callbacks completely stable across parent re-renders
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const mapItemToOptionRef = useRef(mapItemToOption);
  mapItemToOptionRef.current = mapItemToOption;

  const pageRef = useRef(1);
  const searchRef = useRef('');
  const hasMoreRef = useRef(true);
  const inFlightRef = useRef(false);
  const selectedOptionRef = useRef<SelectOption | null>(null);

  const loadData = useCallback(async (targetPage: number, search: string, append = false) => {
    // Guard against duplicate concurrent requests
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (targetPage === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await fetchPageRef.current(targetPage, search);
      const mapped = (result?.items || []).map(mapItemToOptionRef.current);

      setOptions((prev) => {
        let nextOptions: SelectOption[];
        if (append) {
          const existingValues = new Set(prev.map((o) => String(o.value)));
          const newUnique = mapped.filter((o) => !existingValues.has(String(o.value)));
          nextOptions = [...prev, ...newUnique];
        } else {
          nextOptions = mapped;
          // Retain selected option at the top if it is not present in the new page
          if (
            selectedOptionRef.current &&
            !nextOptions.some((o) => String(o.value) === String(selectedOptionRef.current?.value))
          ) {
            nextOptions = [selectedOptionRef.current, ...nextOptions];
          }
        }
        return nextOptions;
      });

      const more = Boolean(result?.hasMore);
      hasMoreRef.current = more;
      setHasMore(more);
      pageRef.current = targetPage;
      searchRef.current = search;
    } catch (err) {
      console.error('Failed to load paginated select options:', err);
      if (!append) setOptions([]);
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load runs once on mount, again whenever `enabled` flips false ->
  // true, and again whenever `resetKey` changes (e.g. a filter param baked
  // into fetchPage's closure, like a selected salesmanId).
  useEffect(() => {
    if (!enabled) return;
    searchRef.current = '';
    loadData(1, '', false);
  }, [enabled, resetKey, loadData]);

  // Sync selectedOptionRef when options change or selectedValue changes
  useEffect(() => {
    if (selectedValue !== undefined && selectedValue !== '') {
      const match = options.find((o) => String(o.value) === String(selectedValue));
      if (match) {
        selectedOptionRef.current = match;
      }
    }
  }, [selectedValue, options]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreRef.current && !inFlightRef.current) {
      loadData(pageRef.current + 1, searchRef.current, true);
    }
  }, [loadData]);

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      searchRef.current = newSearch;
      loadData(1, newSearch, false);
    },
    [loadData]
  );

  const addOption = useCallback((option: SelectOption) => {
    selectedOptionRef.current = option;
    setOptions((prev) => {
      const filtered = prev.filter((o) => String(o.value) !== String(option.value));
      return [option, ...filtered];
    });
  }, []);

  const refetch = useCallback(() => {
    return loadData(1, searchRef.current, false);
  }, [loadData]);

  return {
    options,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    onSearchChange: handleSearchChange,
    addOption,
    refetch,
  };
}

export default useInfiniteSelect;

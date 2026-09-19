import { useState, useEffect, useCallback, useRef } from 'react';
import type { SelectOption } from '../components/ui/Select';

export interface UseInfiniteSelectProps<T> {
  fetchPage: (page: number, search: string) => Promise<{
    items: T[];
    hasMore: boolean;
  }>;
  mapItemToOption: (item: T) => SelectOption;
  selectedValue?: string | number;
}

export function useInfiniteSelect<T>({
  fetchPage,
  mapItemToOption,
  selectedValue,
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

  // Initial load runs strictly once on mount
  useEffect(() => {
    loadData(1, '', false);
  }, [loadData]);

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

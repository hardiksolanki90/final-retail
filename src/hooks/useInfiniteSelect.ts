import { useState, useEffect, useCallback, useRef } from 'react';
import type { SelectOption } from '../components/ui/Select';

export interface UseInfiniteSelectProps<T> {
  /**
   * `perPage` is optional and only passed by `loadAll()` (see below), asking
   * for a much bigger page than the UI's normal scroll-page size — existing
   * callers that only destructure `(page, search)` keep working unchanged.
   */
  fetchPage: (page: number, search: string, perPage?: number) => Promise<{ items: T[]; hasMore: boolean }>;
  mapItemToOption: (item: T) => SelectOption;
  selectedValue?: string | number;
  /**
   * Label for `selectedValue` when it may not be on the first fetched page
   * (e.g. an edit form's saved value) — kept in the list so the Select can
   * display it. Ignored unless its value equals `selectedValue`.
   */
  initialOption?: SelectOption | null;
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

// loadAll() requests pages this big instead of the UI's normal small scroll-page
// size, so a few-hundred-record list takes 1-2 round trips instead of a dozen+.
const BULK_PAGE_SIZE = 200;

export function useInfiniteSelect<T>({ fetchPage, mapItemToOption, selectedValue, initialOption, enabled = true, resetKey }: UseInfiniteSelectProps<T>) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

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
  // Mirrors `options` synchronously (state updates aren't visible until the
  // next render) so loadAll can read the true accumulated list right after
  // its awaited loop, not a stale closure snapshot.
  const optionsRef = useRef<SelectOption[]>([]);

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

      let nextOptions: SelectOption[];
      if (append) {
        const existingValues = new Set(optionsRef.current.map((o) => String(o.value)));
        const newUnique = mapped.filter((o) => !existingValues.has(String(o.value)));
        nextOptions = [...optionsRef.current, ...newUnique];
      } else {
        nextOptions = mapped;
        // Retain selected option at the top if it is not present in the new page
        if (selectedOptionRef.current && !nextOptions.some((o) => String(o.value) === String(selectedOptionRef.current?.value))) {
          nextOptions = [selectedOptionRef.current, ...nextOptions];
        }
      }
      optionsRef.current = nextOptions;
      setOptions(nextOptions);

      const more = Boolean(result?.hasMore);
      hasMoreRef.current = more;
      setHasMore(more);
      pageRef.current = targetPage;
      searchRef.current = search;
    } catch (err) {
      console.error('Failed to load paginated select options:', err);
      if (!append) {
        optionsRef.current = [];
        setOptions([]);
      }
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

  // Keep the caller-supplied label for the saved value in the list, even when
  // it isn't on the fetched page.
  useEffect(() => {
    if (!initialOption || String(initialOption.value) !== String(selectedValue)) return;
    selectedOptionRef.current = initialOption;
    if (!optionsRef.current.some((o) => String(o.value) === String(initialOption.value))) {
      optionsRef.current = [initialOption, ...optionsRef.current];
      setOptions(optionsRef.current);
    }
  }, [initialOption, selectedValue, options]);

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
    const filtered = optionsRef.current.filter((o) => String(o.value) !== String(option.value));
    const next = [option, ...filtered];
    optionsRef.current = next;
    setOptions(next);
  }, []);

  const refetch = useCallback(() => {
    return loadData(1, searchRef.current, false);
  }, [loadData]);

  // Fetches every matching record for the current search term, then returns
  // the full list — used by a "Select all" control so it selects everything,
  // not just what's been scroll-paginated in so far. Requests a much bigger
  // page size than the UI's normal small pages (15) so a few-hundred-record
  // list takes 1-2 round trips instead of a dozen+ — it replaces the loaded
  // list outright rather than resuming from wherever scrolling left off,
  // since mixing two different page sizes mid-pagination would misalign
  // which records "page N" actually refers to.
  const loadAll = useCallback(async (): Promise<SelectOption[]> => {
    while (inFlightRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    inFlightRef.current = true;
    setIsLoadingAll(true);

    try {
      const search = searchRef.current;
      let page = 1;
      let more = true;
      let all: SelectOption[] = [];

      while (more) {
        const result = await fetchPageRef.current(page, search, BULK_PAGE_SIZE);
        all = [...all, ...(result?.items || []).map(mapItemToOptionRef.current)];
        more = Boolean(result?.hasMore);
        page += 1;
      }

      optionsRef.current = all;
      setOptions(all);
      hasMoreRef.current = false;
      setHasMore(false);

      return all;
    } finally {
      inFlightRef.current = false;
      setIsLoadingAll(false);
    }
  }, []);

  return { options, isLoading, isLoadingMore, isLoadingAll, hasMore, onLoadMore: handleLoadMore, onSearchChange: handleSearchChange, addOption, refetch, loadAll };
}

export default useInfiniteSelect;

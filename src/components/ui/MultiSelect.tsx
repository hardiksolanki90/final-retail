import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import type { SelectOption } from './Select';

export type { SelectOption };

interface MultiSelectProps {
  label?: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  // Infinite scroll & pagination props — same contract as Select.tsx
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onSearchChange?: (query: string) => void;
  /**
   * For an infinite-scroll list: fetches every remaining page for the
   * current search term and resolves with the full list. When provided,
   * "Select all" fetches everything first instead of only selecting what's
   * already been paginated in.
   */
  onLoadAll?: () => Promise<SelectOption[]>;
  isLoadingAll?: boolean;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
  required,
  searchable = false,
  searchPlaceholder = 'Search...',
  isLoading = false,
  loadingMessage = 'Loading...',
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onSearchChange,
  onLoadAll,
  isLoadingAll = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string | number) => {
    const v = String(optionValue);
    if (value.includes(v)) {
      onChange(value.filter((existing) => existing !== v));
    } else {
      onChange([...value, v]);
    }
  };

  const removeTag = (e: React.MouseEvent, optionValue: string | number) => {
    e.stopPropagation();
    const v = String(optionValue);
    onChange(value.filter((existing) => existing !== v));
  };

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    if (onSearchChange) {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => onSearchChange(query), 250);
    }
  };

  const filteredOptions = onSearchChange ? options : options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  const canLoadMore = Boolean(onLoadMore) && hasMore && !isLoadingMore && !isLoading;

  const triggerLoadMore = () => {
    if (canLoadMore) onLoadMore?.();
  };

  useEffect(() => {
    if (!isOpen || !canLoadMore) return;
    const scrollEl = scrollContainerRef.current;
    const sentinelEl = sentinelRef.current;
    if (!scrollEl || !sentinelEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) triggerLoadMore();
      },
      { root: scrollEl, rootMargin: '60px', threshold: 0.1 }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, canLoadMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight <= 50) triggerLoadMore();
  };

  const selectedOptions = options.filter((opt) => value.includes(String(opt.value)));

  // "Select all" acts on whatever's currently loaded/filtered — for an
  // infinite-scroll list that's everything paginated in so far, not
  // necessarily every record on the server.
  const filteredValues = filteredOptions.map((opt) => String(opt.value));
  const allFilteredSelected = filteredValues.length > 0 && filteredValues.every((v) => value.includes(v));

  const toggleSelectAll = async () => {
    if (allFilteredSelected) {
      onChange(value.filter((v) => !filteredValues.includes(v)));
      return;
    }

    if (onLoadAll) {
      const all = await onLoadAll();
      const allValues = all.map((opt) => String(opt.value));
      onChange(Array.from(new Set([...value, ...allValues])));
      return;
    }

    onChange(Array.from(new Set([...value, ...filteredValues])));
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          className={`
            min-h-[42px] w-full px-3 py-1.5 rounded-lg border flex flex-wrap gap-2 items-center cursor-pointer transition-colors
            bg-white dark:bg-gray-800
            ${error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary-500'}
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span key={opt.value} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500 text-white text-xs font-medium">
                {opt.label}
                <button type="button" onClick={(e) => removeTag(e, opt.value)} className="hover:text-blue-200 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">{isLoading ? loadingMessage : placeholder}</span>
          )}
          <div className="ml-auto pl-2">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/75 dark:bg-gray-900/60">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-7 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {!isLoading && filteredOptions.length > 0 && (
              <div
                onClick={isLoadingAll ? undefined : toggleSelectAll}
                className={`px-4 py-2 text-sm transition-colors border-b border-gray-100 dark:border-gray-700 flex items-center justify-between font-medium text-primary-600 dark:text-primary-400 ${
                  isLoadingAll ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                {isLoadingAll ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    Loading all...
                  </span>
                ) : (
                  <span>{allFilteredSelected ? 'Deselect all' : 'Select all'}</span>
                )}
                {allFilteredSelected && !isLoadingAll && <Check className="w-4 h-4" />}
              </div>
            )}

            <div ref={scrollContainerRef} onScroll={handleScroll} className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>{loadingMessage}</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
              ) : (
                <>
                  {filteredOptions.map((opt) => {
                    const isSelected = value.includes(String(opt.value));
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={`
                          px-4 py-2 text-sm cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0
                          ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                        `}
                      >
                        {opt.label}
                      </div>
                    );
                  })}
                  {canLoadMore && <div ref={sentinelRef} className="h-1 w-full" />}
                  {isLoadingMore && (
                    <div className="py-2.5 px-3 flex items-center justify-center gap-2 text-xs text-primary-600 dark:text-primary-400 bg-gray-50/50 dark:bg-gray-900/30">
                      <div className="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading more...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

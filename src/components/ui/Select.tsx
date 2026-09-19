import { forwardRef, useState, useRef, useEffect, type SelectHTMLAttributes, type ReactNode } from 'react';
import { ChevronDown, Search, X, Check, Plus } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  /** Optional leading visual (flag emoji, icon) rendered larger than the label text. */
  prefix?: ReactNode;
}

export interface SelectCreateAction {
  label: string;
  onClick: () => void;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  createAction?: SelectCreateAction;
  // Infinite scroll & pagination props
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onSearchChange?: (query: string) => void;
  pageSize?: number;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = 'Select an option',
      leftIcon,
      fullWidth = true,
      className = '',
      id,
      isLoading = false,
      loadingMessage = 'Loading...',
      searchable = true,
      searchPlaceholder = 'Search...',
      createAction,
      disabled = false,
      value,
      defaultValue,
      onChange,
      onBlur,
      name,
      hasMore = false,
      isLoadingMore = false,
      onLoadMore,
      onSearchChange,
      pageSize = 25,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [internalValue, setInternalValue] = useState<string | number>(
      typeof defaultValue === 'string' || typeof defaultValue === 'number' ? defaultValue : ''
    );
    const [visibleCount, setVisibleCount] = useState<number>(pageSize);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const selectedOption = options.find((opt) => String(opt.value) === String(currentValue));

    // Reset visible count when options change or dropdown opens/closes
    useEffect(() => {
      setVisibleCount(pageSize);
    }, [pageSize, isOpen, options.length]);

    // Handle click outside to close dropdown
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
          (onBlur as (() => void) | undefined)?.();
        }
      }
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onBlur]);

    // Auto-focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    const handleSelect = (optionValue: string | number) => {
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      setIsOpen(false);
      setSearchQuery('');

      if (onChange) {
        onChange({
          target: { value: optionValue, name: name || selectId },
          currentTarget: { value: optionValue, name: name || selectId },
        } as any);
      }
    };

    const handleToggle = () => {
      if (disabled || isLoading) return;
      setIsOpen((prev) => !prev);
    };

    const handleSearchInput = (query: string) => {
      setSearchQuery(query);
      setVisibleCount(pageSize);

      if (onSearchChange) {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current);
        }
        searchDebounceRef.current = setTimeout(() => {
          onSearchChange(query);
        }, 250);
      }
    };

    // Client-side filtering when onSearchChange is NOT provided
    const filteredOptions = onSearchChange
      ? options
      : options.filter((opt) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return (
          String(opt.label).toLowerCase().includes(q) ||
          String(opt.value).toLowerCase().includes(q)
        );
      });

    // Options to display: either server paginated (all filteredOptions) or client paginated (slice)
    const displayedOptions = onLoadMore
      ? filteredOptions
      : filteredOptions.slice(0, visibleCount);

    const canLoadMore = onLoadMore
      ? Boolean(hasMore) && !isLoadingMore && !isLoading
      : visibleCount < filteredOptions.length;

    const triggerLoadMore = () => {
      if (onLoadMore) {
        if (hasMore && !isLoadingMore && !isLoading) {
          onLoadMore();
        }
      } else {
        if (visibleCount < filteredOptions.length) {
          setVisibleCount((prev) => prev + pageSize);
        }
      }
    };

    // IntersectionObserver sentinel for smooth infinite scroll
    useEffect(() => {
      if (!isOpen || !canLoadMore) return;
      const scrollEl = scrollContainerRef.current;
      const sentinelEl = sentinelRef.current;
      if (!scrollEl || !sentinelEl) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry?.isIntersecting) {
            triggerLoadMore();
          }
        },
        { root: scrollEl, rootMargin: '60px', threshold: 0.1 }
      );

      observer.observe(sentinelEl);
      return () => observer.disconnect();
    }, [isOpen, canLoadMore, triggerLoadMore]);

    // Fallback onScroll handler
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight <= 50) {
        triggerLoadMore();
      }
    };

    return (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        {/* Hidden select for form bindings and accessibility */}
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={currentValue ?? ''}
          disabled={disabled || isLoading}
          onChange={onChange}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Trigger Button */}
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={disabled || isLoading ? -1 : 0}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className={`
            relative min-h-[42px] w-full px-3 py-2 pr-10 rounded-lg border transition-colors
            flex items-center justify-between text-left
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            ${disabled || isLoading
              ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-700'
              : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
            ${error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
            }
            ${leftIcon ? 'pl-10' : ''}
            ${className}
          `}
        >
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <span className={`flex items-center gap-2 truncate text-sm ${!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}`}>
            {!isLoading && selectedOption?.prefix && <span className="text-2xl leading-none shrink-0">{selectedOption.prefix}</span>}
            <span className="truncate">{isLoading ? loadingMessage : (selectedOption ? selectedOption.label : placeholder)}</span>
          </span>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center pointer-events-none text-gray-400">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>

        {/* Dropdown Menu Panel */}
        {isOpen && (
          <div className="absolute z-50 left-0 mt-1 w-full min-w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden py-1 text-sm animate-in fade-in zoom-in-95 duration-100">
            {/* Search Textbox Header */}
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
                    className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsOpen(false);
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSearchInput('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List with Infinite Scroll */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="max-h-60 overflow-y-auto py-1 divide-y divide-gray-50 dark:divide-gray-800/40"
            >
              {isLoading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>{loadingMessage}</span>
                </div>
              ) : displayedOptions.length === 0 ? (
                <div className="py-4 px-3 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  No options found
                </div>
              ) : (
                <>
                  {displayedOptions.map((option) => {
                    const isSelected = String(option.value) === String(currentValue);
                    return (
                      <div
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => !option.disabled && handleSelect(option.value)}
                        className={`
                          px-3 py-2 flex items-center justify-between cursor-pointer transition-colors text-sm
                          ${option.disabled
                            ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500'
                            : isSelected
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2 truncate font-bold">
                          {option.prefix && <span className="text-2xl leading-none shrink-0">{option.prefix}</span>}
                          <span className="truncate">{option.label}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 ml-2" />}
                      </div>
                    );
                  })}

                  {/* Sentinel element to trigger next page load */}
                  {canLoadMore && <div ref={sentinelRef} className="h-1 w-full" />}

                  {/* Loading more spinner */}
                  {isLoadingMore && (
                    <div className="py-2.5 px-3 flex items-center justify-center gap-2 text-xs text-primary-600 dark:text-primary-400 bg-gray-50/50 dark:bg-gray-900/30">
                      <div className="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading more...</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Create Action Footer */}
            {createAction && !isLoading && (
              <div className="border-t border-gray-100 dark:border-gray-700 p-1 bg-gray-50/50 dark:bg-gray-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery('');
                    createAction.onClick();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-colors text-left"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>{createAction.label.replace(/^\+\s*/, '')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

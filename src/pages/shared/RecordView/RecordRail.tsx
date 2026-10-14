import { useEffect, useRef, useState, type RefObject } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { RAIL_KEY } from '../../../lib/recordCache';
import { useDebounce } from '../../../hooks/useDebounce';
import { DETAIL_STALE_MS } from '../../../hooks/useEntityDetail';
import { Skeleton } from '../../../components/ui/skeleton';

/** The page size a list gets from the API when it doesn't ask for one (15) — the page size of lists that load through the API default. */
export const API_PAGE_SIZE = 15;

/** What one rail card shows. */
export interface RailCard {
  key: string;
  title: string;
  subtitle?: string | null;
  /** Right-hand figure, already formatted (balance, document total, date). */
  amount?: string | null;
  /** Arrow beside the amount: up = to collect, down = to pay. */
  trend?: 'up' | 'down' | null;
}

export interface RecordRailProps<T> {
  /** Cache key for this rail's pages, e.g. "customer". */
  queryKey: string;
  placeholder: string;
  fetchPage: (page: number, search: string) => Promise<{ items: T[]; hasMore: boolean }>;
  toCard: (item: T) => RailCard;
  selectedKey?: string | null;
  onSelect: (item: T) => void;
  /** Turn off `/` and ↑/↓ while another record view is open on top of this one. Default on. */
  keyboard?: boolean;
  /** Warms the cache for a record's details when its card is hovered (or about to be reached with ↑/↓), so opening it needs no wait. The key must be the one the view reads; a key ending in nothing (no uuid) is skipped. */
  /** Records the host page already holds for this list's first page (no search): shown at once, so opening the view sends no list request. Its page size must match `fetchPage`'s, or the next page would skip rows. */
  seed?: { items: T[]; hasMore: boolean; /** When the rows arrived (ms): a seed older than the cache lifetime is refreshed in the background. */ updatedAt?: number } | null;
  prefetch?: { key: (item: T) => readonly unknown[]; fetch: (item: T) => Promise<unknown> };
}

const typing = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** Left column of the record view: search box + every record as a card, loaded page by page as it scrolls. `/` focuses search, ↑/↓ move between records. */
export function RecordRail<T>({ queryKey, placeholder, fetchPage, toCard, selectedKey, onSelect, keyboard = true, prefetch, seed, searchRef }: RecordRailProps<T> & { searchRef: RefObject<HTMLInputElement | null> }) {
  const [search, setSearch] = useState('');
  const term = useDebounce(search.trim(), 300);
  const query = useInfiniteQuery({
    queryKey: [RAIL_KEY, queryKey, term],
    queryFn: ({ pageParam }) => fetchPage(pageParam, term),
    initialPageParam: 1,
    initialData: seed && !term ? { pages: [{ items: seed.items, hasMore: seed.hasMore }], pageParams: [1] } : undefined,
    initialDataUpdatedAt: seed?.updatedAt,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
  });
  const queryClient = useQueryClient();
  const warm = (item?: T) => {
    const key = item && prefetch?.key(item);
    if (item && prefetch && key?.at(-1)) void queryClient.prefetchQuery({ queryKey: key, queryFn: () => prefetch.fetch(item), staleTime: DETAIL_STALE_MS });
  };
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const cards = items.map(toCard);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { root: listRef.current, rootMargin: '120px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Keyboard: "/" jumps to search, ↑/↓ open the previous / next record.
  const latest = useRef({ items, cards, selectedKey, onSelect, warm });
  useEffect(() => {
    latest.current = { items, cards, selectedKey, onSelect, warm };
  });
  useEffect(() => {
    if (!keyboard) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const { items: list, cards: shown, selectedKey: current, onSelect: select, warm: preload } = latest.current;
      if (list.length === 0) return;
      e.preventDefault();
      const at = shown.findIndex((c) => c.key === current);
      const next = at === -1 ? 0 : Math.min(Math.max(at + (e.key === 'ArrowDown' ? 1 : -1), 0), list.length - 1);
      if (next !== at) {
        select(list[next]);
        preload(list[next + (e.key === 'ArrowDown' ? 1 : -1)]);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchRef, keyboard]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selectedKey]);

  return (
    <aside className="hidden w-[399px] shrink-0 flex-col lg:flex border-r border-[var(--rv-line)] pb-[10px] pl-[10px] pr-[12px] pt-[10px]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rv-icon)]" />
        <input
          ref={searchRef}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-[38px] w-full rounded-[4px] border border-[var(--rv-border)] bg-[var(--rv-bg)] pl-[37px] pr-3 text-[15px] text-[var(--rv-ink)] shadow-[0_1px_2px_rgb(0_0_0/0.04)] outline-none placeholder:text-[var(--rv-placeholder)] focus:border-[var(--rv-accent-border)] focus:ring-2 focus:ring-[var(--rv-ring)]"
        />
      </label>
      <div ref={listRef} className="mt-[17px] min-h-0 flex-1 space-y-1 overflow-y-auto" aria-busy={query.isLoading}>
        {query.isLoading ? (
          [0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between min-h-[85px] rounded-lg border border-transparent px-[13px] pb-[19px] pt-5" aria-hidden>
              <div>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2.5 h-3.5 w-20" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))
        ) : cards.length === 0 ? (
          <p className="px-[13px] py-8 text-center text-[15px] text-[var(--rv-muted)]">{term ? `No results for “${term}”` : 'Nothing here yet'}</p>
        ) : (
          cards.map((card, i) => {
            const selected = card.key === selectedKey;
            const Trend = card.trend === 'down' ? ArrowDown : ArrowUp;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => onSelect(items[i])}
                onMouseEnter={() => { clearTimeout(hoverTimer.current); hoverTimer.current = setTimeout(() => warm(items[i]), 120); }}
                onMouseLeave={() => clearTimeout(hoverTimer.current)}
                onFocus={() => warm(items[i])}
                aria-current={selected}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border p-2 text-left transition-colors ${selected ? 'border-[var(--rv-accent-border)] bg-[var(--rv-accent-soft)]' : 'border-transparent hover:bg-[var(--rv-hover)]'}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium leading-5 text-[var(--rv-text)]">{card.title}</span>
                  {card.subtitle && <span className="mt-1 block truncate text-[13px] leading-5 text-[var(--rv-muted)]">{card.subtitle}</span>}
                </span>
                {card.amount && (
                  <span className="flex min-w-0 max-w-[50%] shrink-0 items-center gap-1.5 text-[15px] text-[var(--rv-ink)] tabular-nums">
                    <span className="truncate">{card.amount}</span>
                    {card.trend && <Trend className={`h-4 w-4 ${card.trend === 'down' ? 'text-[var(--rv-success)]' : 'text-[var(--rv-danger)]'}`} />}
                  </span>
                )}
              </button>
            );
          })
        )}
        {isFetchingNextPage && <Skeleton className="mx-[13px] my-3 h-4 w-40" />}
        <div ref={sentinelRef} className="h-px" />
      </div>
    </aside>
  );
}

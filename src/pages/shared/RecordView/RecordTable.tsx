import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ReceiptIndianRupee, ReceiptText, X } from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { useMoney } from '../../../hooks/Currency/useMoney';

export interface RecordColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  /** Fixed width class, e.g. "w-12"; columns without one share the rest equally. */
  width?: string;
  render: (row: T) => ReactNode;
}

export interface RecordSort {
  key: string;
  direction: 'asc' | 'desc';
}

interface RecordTableProps<T> {
  columns: RecordColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyLabel: string;
  sort?: RecordSort | null;
  onSort?: (sort: RecordSort) => void;
  onRowClick?: (row: T) => void;
  /** More rows on the server: a sentinel at the bottom asks for them when scrolled into view. */
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  /** Extra rows under the body (totals, closing balance). */
  footer?: ReactNode;
  /** Sits inside a bordered, scrolling container: no border of its own, and the header row sticks while the body scrolls. */
  bare?: boolean;
}

const cell = 'px-[13px]';

/** Empty-state art: a receipt (₹ for INR books) with a cross. */
function EmptyArt() {
  const Receipt = useMoney().code === 'INR' ? ReceiptIndianRupee : ReceiptText;
  return (
    <span className="relative mx-auto block h-14 w-14 text-[var(--rv-empty)]">
      <Receipt className="h-14 w-14" strokeWidth={1.25} />
      <X className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-[var(--rv-bg)]" strokeWidth={1.75} />
    </span>
  );
}

/** The record view's table: gray header row, optional sortable columns, skeleton rows while loading and an illustrated empty state. */
export function RecordTable<T>({ columns, rows, rowKey, isLoading = false, emptyLabel, sort, onSort, onRowClick, hasMore = false, isLoadingMore = false, onLoadMore, footer, bare = false }: RecordTableProps<T>) {
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || !onLoadMore) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) onLoadMore();
      },
      { rootMargin: '160px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  const toggle = (key: string) => onSort?.({ key, direction: sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc' });
  const skeletonRow = (key: string) => (
    <tr key={key} aria-hidden>
      {columns.map((c) => (
        <td key={c.key} className={`${cell} h-12 border-t border-[var(--rv-border)]`}>
          <Skeleton className={`h-3.5 ${c.align === 'right' ? 'ml-auto w-16' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );

  return (
    <div className={bare ? '' : 'overflow-x-auto rounded-[4px] border border-[var(--rv-border)]'}>
      <table className="w-full min-w-[640px] table-fixed border-collapse text-[15px]/5">
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const Icon = !active ? ChevronsUpDown : sort?.direction === 'asc' ? ChevronUp : ChevronDown;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={`${cell} ${c.width ?? ''} h-10 bg-[var(--rv-head)] font-semibold ${bare ? 'sticky top-0 z-10' : ''} text-[var(--rv-text)] ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {c.sortable && onSort ? (
                    <button type="button" onClick={() => toggle(c.key)} className={`inline-flex cursor-pointer items-center gap-2 font-semibold ${c.align === 'right' ? 'flex-row-reverse' : ''}`}>
                      {c.label}
                      <Icon className={`h-4 w-4 ${active ? 'text-[var(--rv-accent)]' : 'text-[var(--rv-text)]'}`} />
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [0, 1, 2, 3, 4].map((i) => skeletonRow(`s${i}`))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 pb-8 pt-[35px] text-center">
                <EmptyArt />
                <p className="mt-[14px] text-[15px] leading-5 text-[var(--rv-secondary)]">{emptyLabel}</p>
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={rowKey(row, index)} onClick={onRowClick && (() => onRowClick(row))} className={onRowClick ? 'cursor-pointer hover:bg-[var(--rv-hover)]' : undefined}>
                {columns.map((c) => (
                  <td key={c.key} className={`${cell} h-12 truncate border-t border-[var(--rv-border)] text-[var(--rv-text)] ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
          {isLoadingMore && skeletonRow('more')}
          {hasMore && !isLoading && <tr ref={sentinelRef} aria-hidden className="h-px" />}
        </tbody>
        {footer && !isLoading && rows.length > 0 && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
}

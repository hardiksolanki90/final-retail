export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: number[];
  /** Set false while the first page hasn't loaded yet, to skip the "X–Y of Z" summary. */
  hasLoaded?: boolean;
}

const NAV_LABELS = ['First', 'Prev', 'Next', 'Last'] as const;

export function Pagination({
  currentPage,
  totalPages,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 15, 25, 50],
  hasLoaded = true,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[var(--border-color)]">
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <span>Rows per page:</span>
        <select
          value={perPage}
          onChange={(e) => { onPerPageChange(Number(e.target.value)); onPageChange(1); }}
          className="px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {perPageOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        {hasLoaded && (
          <span className="ml-4">
            {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, total)} of {total}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {NAV_LABELS.map((label) => {
          const disabled = label === 'First' || label === 'Prev'
            ? currentPage === 1
            : currentPage === totalPages || totalPages === 0;
          const onClick = () => {
            if (label === 'First') onPageChange(1);
            else if (label === 'Prev') onPageChange(Math.max(currentPage - 1, 1));
            else if (label === 'Next') onPageChange(Math.min(currentPage + 1, totalPages));
            else onPageChange(totalPages);
          };
          return (
            <button
              key={label}
              onClick={onClick}
              disabled={disabled}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {label}
            </button>
          );
        })}
        <span className="px-3 py-1 text-sm text-[var(--text-primary)]">
          Page {currentPage} of {totalPages || 1}
        </span>
      </div>
    </div>
  );
}

export default Pagination;

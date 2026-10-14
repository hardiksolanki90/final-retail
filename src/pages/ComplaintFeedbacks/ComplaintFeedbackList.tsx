import { useMemo, useState } from 'react';
import { Check, ChevronDown, Columns3, Filter, Plus, Search } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Pagination } from '../../components/ui/Pagination';
import { TableEmptyRow } from '../../components/ui/TableEmptyRow';
import { TableSkeletonRows, colsByKey } from '../../components/ui/skeleton';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useComplaintFeedbacks } from '../../hooks/ComplaintFeedbacks/useComplaintFeedbacks';
import type { ComplaintFeedback, ComplaintFeedbackListParams } from '../../types/ComplaintFeedback';
import { ComplaintFeedbackAdd } from './ComplaintFeedbackAdd';
import { ComplaintFeedbackView } from './ComplaintFeedbackView';

type FilterState = Pick<ComplaintFeedbackListParams, 'date' | 'route' | 'complaintId' | 'merchandiserName' | 'title' | 'itemCode' | 'itemName' | 'type'>;
type ColumnKey = 'date' | 'routeName' | 'complaintId' | 'merchandiserName' | 'title' | 'itemCode' | 'itemName' | 'type';

interface Column {
  key: ColumnKey;
  label: string;
  visible: boolean;
}

const COLUMNS: Column[] = [
  { key: 'date', label: 'Date', visible: true },
  { key: 'routeName', label: 'Route', visible: true },
  { key: 'complaintId', label: 'Complaint ID', visible: true },
  { key: 'merchandiserName', label: 'Merchandiser Name', visible: true },
  { key: 'title', label: 'Feedback Title', visible: true },
  { key: 'itemCode', label: 'Item Code', visible: true },
  { key: 'itemName', label: 'Item Name', visible: true },
  { key: 'type', label: 'Type', visible: false },
];

const EMPTY_FILTERS: FilterState = { date: '', route: '', complaintId: '', merchandiserName: '', title: '', itemCode: '', itemName: '', type: '' };

function formatDate(value: string) {
  const date = parseISO(value);
  return isValid(date) ? format(date, 'd MMM yyyy h:mm a') : '—';
}

function Cell({ column, row }: { column: ColumnKey; row: ComplaintFeedback }) {
  if (column === 'date') return <>{formatDate(row.date || row.createdAt)}</>;
  if (column === 'type') return <span className={`rounded-full px-2 py-1 text-xs font-medium ${row.type === 'complaint' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>{row.type === 'complaint' ? 'Complaint' : 'Suggestion'}</span>;
  return <>{row[column] || '—'}</>;
}

export function ComplaintFeedbackList() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [columns, setColumns] = useState(COLUMNS);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<ComplaintFeedback | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const debouncedFilters = useDebounce(filters, 300);
  const listParams = useMemo(() => ({ search: debouncedSearch || undefined, ...debouncedFilters }), [debouncedSearch, debouncedFilters]);

  const { data, isLoading, isFetching, isError, dataUpdatedAt } = useComplaintFeedbacks({ page, perPage, ...listParams });
  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const visibleColumns = columns.filter((column) => column.visible);
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.uuid));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const viewSeed = useMemo(() => ({ items: rows, hasMore: Boolean(meta?.has_more_pages), updatedAt: dataUpdatedAt }), [rows, meta?.has_more_pages, dataUpdatedAt]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
    setSelected([]);
  };

  const toggleRow = (uuid: string) => setSelected((current) => current.includes(uuid) ? current.filter((id) => id !== uuid) : [...current, uuid]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Complaints & Feedback</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Manage merchandising complaints and suggestions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search complaints" className="h-10 w-56 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-primary-500" />
          </div>
          <button type="button" onClick={() => setFilterOpen((open) => !open)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-4 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
            <Filter className="h-4 w-4" /> Filter {activeFilterCount > 0 && <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-xs text-white">{activeFilterCount}</span>}
          </button>
          <div className="relative">
            <button type="button" onClick={() => setColumnsOpen((open) => !open)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-4 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"><Columns3 className="h-4 w-4" /> Columns <ChevronDown className="h-4 w-4" /></button>
            {columnsOpen && <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] py-1 shadow-lg">{columns.map((column) => <button key={column.key} type="button" onClick={() => setColumns((current) => current.map((item) => item.key === column.key ? { ...item, visible: !item.visible } : item))} className="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"><span>{column.label}</span>{column.visible && <Check className="h-4 w-4 text-primary-600" />}</button>)}</div>}
          </div>
          {hasPermission('complaint-feedback.create') && <button type="button" onClick={() => setAddOpen(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700"><Plus className="h-4 w-4" /> New</button>}
        </div>
      </div>

      {filterOpen && <div className="mx-6 grid gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <input type="date" value={filters.date} onChange={(event) => updateFilter('date', event.target.value)} aria-label="Filter by date" className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]" />
        {(['route', 'complaintId', 'merchandiserName', 'title', 'itemCode', 'itemName'] as const).map((key) => <input key={key} value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)} placeholder={`Filter ${COLUMNS.find((column) => column.key === (key === 'route' ? 'routeName' : key))?.label.toLowerCase()}`} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]" />)}
        <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"><option value="">All types</option><option value="complaint">Complaint</option><option value="suggestion">Suggestion</option></select>
        <button type="button" onClick={() => { setFilters(EMPTY_FILTERS); setPage(1); }} className="cursor-pointer rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">Clear filters</button>
      </div>}

      <div className="mx-6 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]"><th className="w-12 px-4 py-3"><input type="checkbox" aria-label="Select all complaints" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((row) => row.uuid))} /></th>{visibleColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{column.label}</th>)}</tr></thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? <TableSkeletonRows rows={perPage} label="Loading complaints and feedback" columns={['check', ...colsByKey(visibleColumns, { type: 'badge' })]} dense /> : rows.length === 0 ? <TableEmptyRow colSpan={visibleColumns.length + 1} label={isError ? 'Unable to load complaints and feedback.' : 'No complaints or feedback found.'} /> : rows.map((row) => <tr key={row.uuid} onClick={() => setViewing(row)} className={`cursor-pointer hover:bg-[var(--bg-secondary)] ${selected.includes(row.uuid) ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}><td className="px-4 py-3" onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${row.complaintId}`} checked={selected.includes(row.uuid)} onChange={() => toggleRow(row.uuid)} /></td>{visibleColumns.map((column) => <td key={column.key} className="whitespace-nowrap px-4 py-3 text-sm text-[var(--text-primary)]"><Cell column={column.key} row={row} /></td>)}</tr>)}
            </tbody>
          </table>
        </div>
        <div className={isFetching && !isLoading ? 'opacity-70' : ''}><Pagination currentPage={page} totalPages={meta?.last_page ?? 1} total={meta?.total ?? 0} perPage={perPage} onPageChange={setPage} onPerPageChange={(value) => { setPerPage(value); setPage(1); }} /></div>
      </div>

      <ComplaintFeedbackAdd isOpen={addOpen} onClose={() => setAddOpen(false)} />
      <ComplaintFeedbackView key={viewing?.uuid ?? 'closed'} isOpen={Boolean(viewing)} onClose={() => setViewing(null)} complaint={viewing} seed={viewSeed} pageSize={perPage} listParams={listParams} onSelect={setViewing} />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Columns3, Filter, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouteItemGroupingActions, useRouteItemGroupings } from '../../hooks/RouteItemGroupings/useRouteItemGroupings';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { TableEmptyRow } from '../../components/ui/TableEmptyRow';
import { TableSkeletonRows, colsByKey } from '../../components/ui/skeleton';
import { RouteItemGroupingAdd } from './RouteItemGroupingAdd';
import { RouteItemGroupingView } from './RouteItemGroupingView';
import { RouteSelect } from './RouteSelect';
import { SalesmanSelect } from './SalesmanSelect';
import type { RouteItemGrouping } from '../../types/RouteItemGrouping';

interface Column {
  key: string;
  label: string;
  visible: boolean;
  /** Table cell kind for the loading skeleton. */
  kind: 'text' | 'text-sub' | 'number' | 'badge';
}

const COLUMNS: Column[] = [
  { key: 'code', label: 'Code', visible: true, kind: 'text' },
  { key: 'name', label: 'Name', visible: true, kind: 'text' },
  { key: 'route', label: 'Route', visible: true, kind: 'text' },
  { key: 'salesman', label: 'Salesman', visible: true, kind: 'text-sub' },
  { key: 'itemCount', label: 'Items', visible: true, kind: 'number' },
  { key: 'status', label: 'Status', visible: true, kind: 'badge' },
];

const STATUS_OPTIONS = [{ value: '', label: 'All statuses' }, { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }];
const iconButton = 'cursor-pointer rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] disabled:cursor-not-allowed disabled:opacity-40';

function Cell({ column, row }: { column: string; row: RouteItemGrouping }) {
  if (column === 'status') return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${row.status ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{row.status ? 'Active' : 'Inactive'}</span>;
  if (column === 'route') return <>{row.routeName ?? '—'}</>;
  if (column === 'salesman') return <>{row.salesmanName ? [row.salesmanCode, row.salesmanName].filter(Boolean).join(' - ') : '—'}</>;
  return <>{String(row[column as keyof RouteItemGrouping] ?? '—')}</>;
}

export function RouteItemGroupingList() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ routeId: '', salesmanId: '', status: '' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [columns, setColumns] = useState(COLUMNS);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [viewing, setViewing] = useState<RouteItemGrouping | null>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isFetching } = useRouteItemGroupings({ page, perPage, search: search.trim() || undefined, routeId: filter.routeId ? Number(filter.routeId) : undefined, salesmanId: filter.salesmanId ? Number(filter.salesmanId) : undefined, status: filter.status === '' ? undefined : filter.status === '1' });
  const { remove, removeMany } = useRouteItemGroupingActions();
  const rows = data?.data ?? [];
  const meta = data?.meta;
  const visibleColumns = columns.filter((column) => column.visible);
  const activeFilters = Object.values(filter).filter(Boolean).length;
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const busy = remove.isPending || removeMany.isPending;

  useEffect(() => {
    const close = (e: MouseEvent) => columnsRef.current && !columnsRef.current.contains(e.target as Node) && setColumnsOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const changeFilter = (patch: Partial<typeof filter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
    setPage(1);
    setSelected([]);
  };
  const removeRow = (row: RouteItemGrouping) => window.confirm(`Delete ${row.code} - ${row.name}?`) && remove.mutate(row.uuid, { onSuccess: () => setSelected((prev) => prev.filter((uuid) => uuid !== row.uuid)) });
  const removeSelected = () => window.confirm(`Delete ${selected.length} selected route item grouping${selected.length > 1 ? 's' : ''}?`) && removeMany.mutate(selected, { onSuccess: () => setSelected([]) });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-6 pb-0 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Route Item Groupings</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Manage item groupings for routes</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); setSelected([]); }} placeholder="Search by code or name" className="w-64" />
          <button onClick={() => setFilterOpen((prev) => !prev)} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${filterOpen || activeFilters ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}>
            <Filter className="h-4 w-4" />
            Filter
            {activeFilters > 0 && <span className="ml-1 rounded-full bg-primary-600 px-1.5 py-0.5 text-xs text-white">{activeFilters}</span>}
          </button>

          <div className="relative" ref={columnsRef}>
            <button onClick={() => setColumnsOpen((prev) => !prev)} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]">
              <Columns3 className="h-4 w-4" />
              Columns
              <ChevronDown className="h-4 w-4" />
            </button>
            {columnsOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] py-1 shadow-lg">
                {columns.map((column) => (
                  <button key={column.key} onClick={() => setColumns((prev) => prev.map((c) => (c.key === column.key ? { ...c, visible: !c.visible } : c)))} className="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]">
                    <span>{column.label}</span>
                    {column.visible && <Check className="h-4 w-4 text-primary-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected.length > 0 && hasPermission('route-item-grouping.delete') && (
            <button onClick={removeSelected} disabled={busy} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-900/20">
              <Trash2 className="h-4 w-4" />
              Delete ({selected.length})
            </button>
          )}

          {hasPermission('route-item-grouping.create') && (
            <button onClick={() => setIsAddOpen(true)} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
              <Plus className="h-4 w-4" />
              Create
            </button>
          )}
          <RouteItemGroupingAdd isOpen={isAddOpen || editing !== null} onClose={() => { setIsAddOpen(false); setEditing(null); }} editingUuid={editing} />
          <RouteItemGroupingView row={viewing} onClose={() => setViewing(null)} onEdit={(uuid) => { setViewing(null); setEditing(uuid); }} />
        </div>
      </div>

      {filterOpen && (
        <div className="mx-6 mb-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-4 shadow-sm">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
            <RouteSelect label="Route" value={filter.routeId} onChange={(routeId) => changeFilter({ routeId })} allLabel="All routes" />
            <SalesmanSelect label="Salesman" value={filter.salesmanId} onChange={(salesmanId) => changeFilter({ salesmanId })} allLabel="All salesmen" />
            <Select label="Status" value={filter.status} onChange={(e) => changeFilter({ status: e.target.value })} options={STATUS_OPTIONS} searchable={false} />
          </div>
          {activeFilters > 0 && <button onClick={() => changeFilter({ routeId: '', salesmanId: '', status: '' })} className="mt-3 cursor-pointer text-sm font-medium text-primary-600 hover:underline">Clear filters</button>}
        </div>
      )}

      <div className={`mx-6 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] transition-opacity ${isFetching && !isLoading ? 'opacity-70' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((row) => row.uuid))} className="h-4 w-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500" />
                </th>
                {visibleColumns.map((column) => (
                  <th key={column.key} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] ${column.kind === 'number' ? 'text-right' : 'text-left'}`}>{column.label}</th>
                ))}
                <th className="w-24 px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <TableSkeletonRows rows={Math.min(perPage, 25)} label="Loading route item groupings" columns={['check', ...colsByKey(visibleColumns, Object.fromEntries(columns.map((column) => [column.key, column.kind]))), 'actions']} dense />
              ) : rows.length === 0 ? (
                <TableEmptyRow colSpan={visibleColumns.length + 2} label="No route item groupings found." />
              ) : (
                rows.map((row) => (
                  <tr key={row.uuid} onClick={() => setViewing(row)} className={`cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] ${selected.includes(row.uuid) ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`Select ${row.code}`} checked={selected.includes(row.uuid)} onChange={() => setSelected((prev) => (prev.includes(row.uuid) ? prev.filter((uuid) => uuid !== row.uuid) : [...prev, row.uuid]))} className="h-4 w-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500" />
                    </td>
                    {visibleColumns.map((column) => (
                      <td key={column.key} className={`px-4 py-3 text-sm text-[var(--text-primary)] ${column.kind === 'number' ? 'text-right tabular-nums' : ''}`}><Cell column={column.key} row={row} /></td>
                    ))}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        {hasPermission('route-item-grouping.edit') && <button type="button" title="Edit" aria-label="Edit" disabled={busy} onClick={() => setEditing(row.uuid)} className={`${iconButton} hover:text-primary-600`}><Pencil className="h-4 w-4" /></button>}
                        {hasPermission('route-item-grouping.delete') && <button type="button" title="Delete" aria-label="Delete" disabled={busy} onClick={() => removeRow(row)} className={`${iconButton} hover:text-red-600`}><Trash2 className="h-4 w-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={meta?.last_page ?? 1} total={meta?.total ?? 0} perPage={perPage} onPageChange={(next) => { setPage(next); setSelected([]); }} onPerPageChange={(next) => { setPerPage(next); setPage(1); setSelected([]); }} />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Filter, Plus, Columns3, ChevronDown, Check, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolioManagementActions, usePortfolioManagements } from '../../hooks/PortfolioManagements/usePortfolioManagements';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { format, parse, isValid } from 'date-fns';
import { TableEmptyRow } from '../../components/ui/TableEmptyRow';
import { TableSkeletonRows, colsByKey } from '../../components/ui/skeleton';
import { PortfolioManagementAdd } from './PortfolioManagementAdd';
import { PortfolioManagementView } from './PortfolioManagementView';
import type { PortfolioManagement } from '../../types/PortfolioManagement';

function parseDateValue(value: string | undefined | null): Date | null {
  if (!value) return null;
  const raw = value.slice(0, 10);
  const parsed = parse(raw, 'yyyy-MM-dd', new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

interface Column {
  key: string;
  label: string;
  visible: boolean;
  kind: 'text' | 'text-sub' | 'number' | 'badge';
}

const COLUMNS: Column[] = [
  { key: 'code', label: 'CODE', visible: true, kind: 'text' },
  { key: 'name', label: 'NAME', visible: true, kind: 'text' },
  { key: 'startDate', label: 'VALID FROM', visible: true, kind: 'text' },
  { key: 'endDate', label: 'VALID TO', visible: true, kind: 'text' },
  { key: 'status', label: 'STATUS', visible: true, kind: 'badge' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
];

const iconButton = 'cursor-pointer rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-40 transition-colors';

function Cell({ column, row }: { column: string; row: PortfolioManagement }) {
  if (column === 'status') {
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${row.status
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
      >
        {row.status ? 'Active' : 'Inactive'}
      </span>
    );
  }
  if (column === 'code') {
    return <span className="font-mono text-xs text-[var(--text-secondary)]">{row.code}</span>;
  }
  if (column === 'startDate') {
    return <>{row.startDate || '—'}</>;
  }
  if (column === 'endDate') {
    return <>{row.endDate || '—'}</>;
  }
  return <>{String(row[column as keyof PortfolioManagement] ?? '—')}</>;
}

export function PortfolioManagementList() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '', startDate: '', endDate: '' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [columns, setColumns] = useState(COLUMNS);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // Drawer states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [viewingPortfolio, setViewingPortfolio] = useState<PortfolioManagement | null>(null);

  const columnsRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = usePortfolioManagements({
    page,
    perPage,
    search: search.trim() || undefined,
    status: filter.status === '' ? undefined : filter.status === '1',
    startDate: filter.startDate || undefined,
    endDate: filter.endDate || undefined,
  });

  const { remove, removeMany } = usePortfolioManagementActions();
  const rows = data?.data ?? [];
  const meta = data?.meta;
  const visibleColumns = columns.filter((col) => col.visible);
  const activeFilters = Object.values(filter).filter(Boolean).length;
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const isBusy = remove.isPending || removeMany.isPending;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
        setColumnsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeFilter = (patch: Partial<typeof filter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
    setPage(1);
    setSelected([]);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(rows.map((r) => r.uuid));
    }
  };

  const handleSelectRow = (uuid: string) => {
    setSelected((prev) => (prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]));
  };

  const toggleColumn = (key: string) => {
    setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const handleDeleteRow = (row: PortfolioManagement, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${row.code} - ${row.name}?`)) {
      remove.mutate(row.uuid, {
        onSuccess: () => setSelected((prev) => prev.filter((id) => id !== row.uuid)),
      });
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selected.length} selected portfolio${selected.length > 1 ? 's' : ''}?`)) {
      removeMany.mutate(selected, {
        onSuccess: () => setSelected([]),
      });
    }
  };

  const handleEditRow = (row: PortfolioManagement, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUuid(row.uuid);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 px-6 pb-0 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Portfolio Management</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Manage customer pricing and listing portfolios</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
              setSelected([]);
            }}
            placeholder="Search by code or name"
            className="w-64"
          />

          {/* Filter button */}
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${filterOpen || activeFilters
              ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
              : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeFilters > 0 && (
              <span className="ml-1 rounded-full bg-primary-600 px-1.5 py-0.5 text-xs text-white">
                {activeFilters}
              </span>
            )}
          </button>

          {/* Columns button */}
          <div className="relative" ref={columnsRef}>
            <button
              onClick={() => setColumnsOpen((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
            >
              <Columns3 className="h-4 w-4" />
              Columns
              <ChevronDown className="h-4 w-4" />
            </button>
            {columnsOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] py-2 shadow-lg">
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Toggle Columns
                </div>
                {columns.map((col) => (
                  <button
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className="flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  >
                    <span>{col.label}</span>
                    {col.visible && <Check className="h-4 w-4 text-primary-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Portfolio button */}
          {hasPermission('portfolio-management.create') && (
            <button
              onClick={() => {
                setEditingUuid(null);
                setIsAddOpen(true);
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Portfolio
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="mx-6 grid grid-cols-1 gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Status</label>
            <Select
              value={filter.status}
              onChange={(e) => changeFilter({ status: e.target.value })}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Valid From</label>
            <DatePicker
              selected={parseDateValue(filter.startDate)}
              onChange={(date) => {
                const nextStart = date ? format(date, 'yyyy-MM-dd') : '';
                changeFilter({
                  startDate: nextStart,
                  ...(nextStart && filter.endDate && nextStart > filter.endDate ? { endDate: '' } : {}),
                });
              }}
              placeholderText="Select date"
              dateFormat="MMM d, yyyy"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Valid To</label>
            <DatePicker
              selected={parseDateValue(filter.endDate)}
              onChange={(date) => changeFilter({ endDate: date ? format(date, 'yyyy-MM-dd') : '' })}
              placeholderText="Select date"
              dateFormat="MMM d, yyyy"
              minDate={parseDateValue(filter.startDate) ?? undefined}
            />
          </div>
        </div>
      )}

      {/* Bulk action banner */}
      {selected.length > 0 && (
        <div className="mx-6 flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
          <span>{selected.length} portfolio{selected.length > 1 ? 's' : ''} selected</span>
          {hasPermission('portfolio-management.delete') && (
            <button
              onClick={handleDeleteSelected}
              disabled={isBusy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="mx-6 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-color)]">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
                  />
                </th>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] ${col.kind === 'number' ? 'text-right' : 'text-left'
                      }`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] w-24">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <TableSkeletonRows rows={perPage} columns={colsByKey(visibleColumns)} />
              ) : rows.length === 0 ? (
                <TableEmptyRow
                  colSpan={visibleColumns.length + 2}
                  label={
                    search || activeFilters
                      ? 'No portfolios match your filters.'
                      : 'No portfolios yet. Click "+ Add Portfolio" to create one.'
                  }
                />
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.uuid}
                    onClick={() => setViewingPortfolio(row)}
                    className="group cursor-pointer transition-colors hover:bg-[var(--bg-secondary)]/50"
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(row.uuid)}
                        onChange={() => handleSelectRow(row.uuid)}
                        className="h-4 w-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-sm text-[var(--text-primary)] ${col.kind === 'number' ? 'text-right font-mono' : ''
                          }`}
                      >
                        <Cell column={col.key} row={row} />
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {hasPermission('portfolio-management.edit') && (
                          <button
                            type="button"
                            onClick={(e) => handleEditRow(row, e)}
                            className={iconButton}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission('portfolio-management.delete') && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteRow(row, e)}
                            disabled={isBusy}
                            className={`${iconButton} hover:text-red-600`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={meta?.last_page ?? 1}
          total={meta?.total ?? 0}
          perPage={perPage}
          onPageChange={(next) => {
            setPage(next);
            setSelected([]);
          }}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
            setSelected([]);
          }}
          hasLoaded={!isLoading && Boolean(meta)}
        />
      </div>

      {/* Add / Edit Drawer */}
      {isAddOpen && (
        <PortfolioManagementAdd
          editUuid={editingUuid}
          onClose={() => {
            setIsAddOpen(false);
            setEditingUuid(null);
          }}
        />
      )}

      {/* View Drawer */}
      {viewingPortfolio && (
        <PortfolioManagementView
          isOpen={Boolean(viewingPortfolio)}
          uuid={viewingPortfolio.uuid}
          portfolio={viewingPortfolio}
          row={viewingPortfolio}
          pageSize={perPage}
          seed={data && page === 1 && !search && !activeFilters ? { items: rows, hasMore: Boolean(meta?.has_more_pages) } : null}
          onSelect={(_uuid, row) => {
            setViewingPortfolio(row);
          }}
          onClose={() => setViewingPortfolio(null)}
          onEdit={(uuid) => {
            setViewingPortfolio(null);
            setEditingUuid(uuid);
            setIsAddOpen(true);
          }}
        />
      )}
    </div>
  );
}

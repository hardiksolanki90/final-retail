import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Columns3, ChevronDown, Check, Trash2, Archive, Tag, Pencil, Filter } from 'lucide-react';
import { useRules, useRuleDetail } from '../../hooks/usePricingPromotionRules';
import { TableSkeletonRows, colsByKey } from '../../components/ui/skeleton';
import { TableEmptyRow } from '../../components/ui/TableEmptyRow';
import { Pagination } from '../../components/ui/Pagination';
import { RuleViewDrawer } from '../shared/RuleViewDrawer';
import { showToast } from '../../lib/toast';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

export function DiscountList() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const bulkActionRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const activeFilterCount = [searchTerm].filter(Boolean).length;
  const [isViewOpen, setIsViewOpen] = useState(false);
  // The rule shown in the View drawer: its full details (dimensions, items) come from the query cache.
  const [viewUuid, setViewUuid] = useState<string | null>(null);

  const { rules, total, isLoading, bulkAction } = useRules('discount', currentPage, searchTerm);
  const viewQuery = useRuleDetail('discount', viewUuid);
  const viewRule = viewUuid ? (viewQuery.data ?? null) : null;
  const isViewLoading = Boolean(viewUuid) && viewQuery.isPending;
  const viewFailed = Boolean(viewUuid) && viewQuery.isError && !viewQuery.isFetching;
  useEffect(() => {
    if (viewFailed) showToast.error('Failed to load details');
  }, [viewFailed]);

  const rowsData = useMemo(() => rules.map((r) => ({ id: r.uuid ?? '', name: r.name, startDate: r.startDate ?? '—', endDate: r.endDate ?? '—' })), [rules]);

  const [columns, setColumns] = useState<Column[]>([
    { key: 'name', label: 'Name', visible: true },
    { key: 'startDate', label: 'Start Date', visible: true },
    { key: 'endDate', label: 'End Date', visible: true },
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
        setBulkActionOpen(false);
      }
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
        setColumnsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const visibleColumns = columns.filter((col) => col.visible);

  const handleSelectAll = () => {
    setSelectedRows(selectedRows.length === rowsData.length ? [] : rowsData.map((item) => item.id));
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  };

  const toggleColumn = (key: string) => {
    setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const handleDelete = (uuid: string) => {
    if (!window.confirm('Delete this discount? This cannot be undone.')) return;
    bulkAction({ uuids: [uuid], action: 'delete' });
  };

  // View — open the drawer immediately with a loader, then fill it in once
  // the full detail (dimensions, slabs) arrives.
  const handleViewClick = (uuid: string) => {
    if (viewUuid === uuid && viewFailed) viewQuery.refetch();
    setViewUuid(uuid);
    setIsViewOpen(true);
  };

  const applyFilters = () => {
    setSearchTerm(searchDraft);
    setCurrentPage(1);
  };
  const clearFilters = () => {
    setSearchDraft('');
    setSearchTerm('');
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const bulkActions = [
    {
      label: 'Activate Selected',
      icon: Tag,
      action: () => {
        bulkAction({ uuids: selectedRows, action: 'activate' });
        setSelectedRows([]);
      },
    },
    {
      label: 'Deactivate Selected',
      icon: Archive,
      action: () => {
        bulkAction({ uuids: selectedRows, action: 'deactivate' });
        setSelectedRows([]);
      },
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      action: () => {
        bulkAction({ uuids: selectedRows, action: 'delete' });
        setSelectedRows([]);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pl-6 pb-0 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Discount</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage customer/item-group discounts</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
              filterOpen || activeFilterCount > 0
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">{activeFilterCount}</span>}
          </button>

          {selectedRows.length > 0 && (
            <div className="relative" ref={bulkActionRef}>
              <button
                onClick={() => setBulkActionOpen(!bulkActionOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Bulk Action
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">{selectedRows.length}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {bulkActionOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    {bulkActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          action.action();
                          setBulkActionOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative" ref={columnsRef}>
            <button
              onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
            >
              <Columns3 className="w-4 h-4" />
              Columns
              <ChevronDown className="w-4 h-4" />
            </button>
            {columnsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                <div className="py-1">
                  {columns.map((column) => (
                    <button
                      key={column.key}
                      onClick={() => toggleColumn(column.key)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <span>{column.label}</span>
                      {column.visible && <Check className="w-4 h-4 text-primary-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/discount/add" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>
      </div>

      {filterOpen && (
        <div className="mx-6 mb-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Search</label>
              <input
                type="text"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Search by name…"
                className="px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <button onClick={applyFilters} className="px-4 cursor-pointer py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="px-4 cursor-pointer py-2 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden transition-theme mx-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === rowsData.length && rowsData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
                  />
                </th>
                {visibleColumns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <TableSkeletonRows rows={rowsPerPage} label="Loading discounts" columns={['check', ...colsByKey(visibleColumns, { startDate: 'date', endDate: 'date' }), 'actions']} dense />
              ) : rowsData.length === 0 ? (
                <TableEmptyRow colSpan={visibleColumns.length + 2} label="No discounts yet." />
              ) : (
                rowsData.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleViewClick(item.id)}
                    className={`cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors ${selectedRows.includes(item.id) ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    {visibleColumns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-[var(--text-primary)] whitespace-nowrap">
                        {item[column.key as keyof typeof item]}
                      </td>
                    ))}
                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/discount/edit/${item.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Pencil size={14} strokeWidth={2.5} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} total={total} perPage={rowsPerPage} onPageChange={setCurrentPage} onPerPageChange={setRowsPerPage} />
      </div>

      <RuleViewDrawer
        isOpen={isViewOpen && !viewFailed}
        onClose={() => {
          setIsViewOpen(false);
          setViewUuid(null);
        }}
        moduleType="discount"
        data={viewRule}
        isLoading={isViewLoading}
        onBulkAction={(action) => {
          if (!viewRule?.uuid) return;
          if (action === 'delete' && !window.confirm('Delete this discount? This cannot be undone.')) return;
          bulkAction({ uuids: [viewRule.uuid], action });
          setIsViewOpen(false);
        }}
      />
    </div>
  );
}

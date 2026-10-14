import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Plus, Columns3, Download, Upload, ChevronDown, Check, Trash2, Archive, Tag, X, Menu } from 'lucide-react';
import axiosInstance from '../../lib/axios';
import { Pagination } from '../../components/ui/Pagination';
import { useMoney } from '../../hooks/Currency/useMoney';
import { TableSkeletonRows, colsByKey } from '../../components/ui/skeleton';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

export function ReturnList() {
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ['return-list', currentPage, rowsPerPage],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(`/return/list?page=${currentPage}&per_page=${rowsPerPage}`);
        const rows = res.data?.returns || res.data?.data || [];
        return {
          rows: Array.isArray(rows) ? rows : [],
          total: res.data?.pagination?.total ?? res.data?.total ?? rows.length,
          lastPage: res.data?.pagination?.lastPage ?? res.data?.last_page ?? 1,
        };
      } catch (err) {
        console.warn('API /return/list error:', err);
        return { rows: [], total: 0, lastPage: 1 };
      }
    },
    staleTime: 30 * 1000,
  });

  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const bulkActionRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  const [exportType, setExportType] = useState<'all' | 'specific'>('specific');
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xls' | ''>('');

  const [columns, setColumns] = useState<Column[]>([
    { key: 'returnNo', label: 'Return #', visible: true },
    { key: 'orderNo', label: 'Order #', visible: true },
    { key: 'customer', label: 'Customer', visible: true },
    { key: 'date', label: 'Date', visible: true },
    { key: 'items', label: 'Items', visible: true },
    { key: 'amount', label: 'Amount', visible: true },
    { key: 'reason', label: 'Reason', visible: true },
    { key: 'status', label: 'Status', visible: true },
  ]);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState({ returnNo: '', orderNo: '', customer: '', date: '', items: '', amount: '' });
  const [appliedFilter, setAppliedFilter] = useState({ returnNo: '', orderNo: '', customer: '', date: '', items: '', amount: '' });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) setBulkActionOpen(false);
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) setColumnsDropdownOpen(false);
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) setMoreActionsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sourceData: any[] = apiResponse?.rows ?? [];
  const totalCount = apiResponse?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  // Apply filters
  const currentData = sourceData.filter(
    (c: any) =>
      (!appliedFilter.returnNo ||
        String(c.returnNo ?? c.returnNumber ?? '')
          .toLowerCase()
          .includes(appliedFilter.returnNo.toLowerCase())) &&
      (!appliedFilter.orderNo ||
        String(c.orderNo ?? c.invoiceNo ?? '')
          .toLowerCase()
          .includes(appliedFilter.orderNo.toLowerCase())) &&
      (!appliedFilter.customer ||
        String(c.customer ?? '')
          .toLowerCase()
          .includes(appliedFilter.customer.toLowerCase())) &&
      (!appliedFilter.date ||
        String(c.date ?? c.returnDate ?? '')
          .toLowerCase()
          .includes(appliedFilter.date.toLowerCase())) &&
      (!appliedFilter.items ||
        String(c.items ?? '')
          .toLowerCase()
          .includes(appliedFilter.items.toLowerCase())) &&
      (!appliedFilter.amount ||
        String(c.amount ?? c.finalTotal ?? '')
          .toLowerCase()
          .includes(appliedFilter.amount.toLowerCase()))
  );

  const handleSelectAll = () => setSelectedRows(selectedRows.length === currentData.length ? [] : currentData.map((item: any) => item.uuid || item.id));
  const handleSelectRow = (id: string | number) => setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  const toggleColumn = (key: string) => setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  const visibleColumns = columns.filter((col) => col.visible);

  const handleExportSubmit = () => {
    setExportModalOpen(false);
    setExportType('specific');
    setExportFromDate('');
    setExportToDate('');
    setExportFormat('');
  };
  const handleExportCancel = () => {
    setExportModalOpen(false);
    setExportType('specific');
    setExportFromDate('');
    setExportToDate('');
    setExportFormat('');
  };

  const bulkActions = [
    {
      label: 'Delete Selected',
      icon: Trash2,
      action: async () => {
        if (!selectedRows.length) return;
        try {
          await axiosInstance.post('/return/bulk-action', {
            action: 'delete',
            uuids: selectedRows.map(String),
          });
          setSelectedRows([]);
          refetch();
        } catch (err) {
          console.error('Bulk delete failed:', err);
        }
      },
    },
    {
      label: 'Activate Selected',
      icon: Check,
      action: async () => {
        if (!selectedRows.length) return;
        try {
          await axiosInstance.post('/return/bulk-action', {
            action: 'activate',
            uuids: selectedRows.map(String),
          });
          setSelectedRows([]);
          refetch();
        } catch (err) {
          console.error('Bulk activate failed:', err);
        }
      },
    },
    {
      label: 'Deactivate Selected',
      icon: Tag,
      action: async () => {
        if (!selectedRows.length) return;
        try {
          await axiosInstance.post('/return/bulk-action', {
            action: 'deactivate',
            uuids: selectedRows.map(String),
          });
          setSelectedRows([]);
          refetch();
        } catch (err) {
          console.error('Bulk deactivate failed:', err);
        }
      },
    },
  ];

  const getStatusBadge = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'processed' || s === 'completed' || s === 'approved') {
      return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
    }
    if (s === 'pending') {
      return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
    }
    if (s === 'rejected') {
      return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
    }
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const { format: formatCurrency } = useMoney();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pl-6 pb-0 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Returns</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage product returns</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.length > 0 && (
            <div className="relative" ref={bulkActionRef}>
              <button
                onClick={() => setBulkActionOpen(!bulkActionOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Bulk Action<span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">{selectedRows.length}</span>
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
          {/* Filter Button */}
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${filterOpen || Object.values(appliedFilter).some(Boolean)
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {Object.values(appliedFilter).some(Boolean) && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">{Object.values(appliedFilter).filter(Boolean).length}</span>
            )}
          </button>

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
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-10">
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
          <Link
            to="/return/add"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>

          <div className="relative" ref={moreActionsRef}>
            <button
              onClick={() => setMoreActionsOpen(!moreActionsOpen)}
              className="inline-flex items-center justify-center p-2 text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <Menu className="w-5 h-5" />
              <ChevronDown className="w-4 h-4" />
            </button>
            {moreActionsOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setExportModalOpen(true);
                      setMoreActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => setMoreActionsOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Accordion */}
      {filterOpen && (
        <div className="mx-6 mb-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            {(
              [
                { key: 'returnNo', label: 'Return No' },
                { key: 'orderNo', label: 'Order No' },
                { key: 'customer', label: 'Customer' },
                { key: 'date', label: 'Date' },
                { key: 'items', label: 'Items' },
                { key: 'amount', label: 'Amount' },
              ] as { key: keyof typeof filterDraft; label: string }[]
            ).map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>
                <input
                  type="text"
                  value={filterDraft[key]}
                  onChange={(e) => setFilterDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={`Filter by ${label.toLowerCase()}...`}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ))}
            <div className="flex items-end gap-2 pb-0.5">
              <button
                onClick={() => {
                  setAppliedFilter({ ...filterDraft });
                }}
                className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  const empty = { returnNo: '', orderNo: '', customer: '', date: '', items: '', amount: '' };
                  setFilterDraft(empty);
                  setAppliedFilter(empty);
                  setFilterOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg transition-colors whitespace-nowrap"
              >
                Cancel
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
                    checked={selectedRows.length === currentData.length && currentData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
                  />
                </th>
                {visibleColumns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <TableSkeletonRows rows={rowsPerPage} label="Loading returns" columns={['check', ...colsByKey(visibleColumns, { date: 'date', status: 'badge' })]} dense />
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    No returns found
                  </td>
                </tr>
              ) : (
                currentData.map((item: any) => {
                  const rowId = item.uuid || item.id;
                  const isSelected = selectedRows.includes(rowId);
                  return (
                    <tr key={rowId} className={`hover:bg-[var(--bg-secondary)] transition-colors ${isSelected ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      {visibleColumns.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                          {column.key === 'returnNo' ? (
                            item.uuid ? (
                              <Link to={`/return/edit/${item.uuid}`} className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                                {item.returnNo || item.returnNumber}
                              </Link>
                            ) : (
                              <span className="font-semibold text-[var(--text-primary)]">{item.returnNo || item.returnNumber}</span>
                            )
                          ) : column.key === 'status' ? (
                            <span className={getStatusBadge(item.status)}>{item.status}</span>
                          ) : column.key === 'amount' ? (
                            formatCurrency(Number(item.amount ?? item.finalTotal ?? 0))
                          ) : (
                            item[column.key as keyof typeof item] ?? '-'
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} total={totalCount} perPage={rowsPerPage} onPageChange={setCurrentPage} onPerPageChange={setRowsPerPage} />
      </div>

      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleExportCancel} />
          <div className="relative bg-[var(--bg-card)] rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Export Returns</h2>
              <button onClick={handleExportCancel} className="p-1 cursor-pointer rounded hover:bg-[var(--bg-secondary)] transition-colors">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-6">
              <p className="text-[var(--text-secondary)]">Export return data in CSV or XLS format.</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'all'}
                    onChange={() => setExportType('all')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)] font-medium">All Returns</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'specific'}
                    onChange={() => setExportType('specific')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)] font-medium">Specific Date Range</span>
                </label>
              </div>
              {exportType === 'specific' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">From</label>
                    <input
                      type="date"
                      value={exportFromDate}
                      onChange={(e) => setExportFromDate(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">To</label>
                    <input
                      type="date"
                      value={exportToDate}
                      onChange={(e) => setExportToDate(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Export As :</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)]">CSV</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'xls'}
                    onChange={() => setExportFormat('xls')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)]">XLS</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-color)]">
              <button onClick={handleExportSubmit} className="px-4 cursor-pointer py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">
                Export
              </button>
              <button
                onClick={handleExportCancel}
                className="px-4 cursor-pointer py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

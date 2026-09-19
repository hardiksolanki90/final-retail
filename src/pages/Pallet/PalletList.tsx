
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Filter,
  Plus,
  Columns3,
  Download,
  Upload,
  ChevronDown,
  Check,
  Trash2,
  Archive,
  Tag,
  X,
  Menu,
} from 'lucide-react';
import { PalletAdd } from './PalletAdd';
import { Pagination } from '../../components/ui/Pagination';
import { createPallet } from '../../api/PalletApi';
import { showToast } from '../../lib/toast';
import type { AddPalletFormData } from '../../types/Pallet';
import { usePallets, usePalletFormOptions } from '../../hooks/Pallet/usePallets';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

export function PalletList() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const bulkActionRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  const [exportType, setExportType] = useState<'all' | 'specific'>('specific');
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xls' | ''>('');

  const [columns, setColumns] = useState<Column[]>([
    { key: 'salesmanCode', label: 'Salesman Code', visible: true },
    { key: 'salesman', label: 'Salesman', visible: true },
    { key: 'totalPalletAllocated', label: 'Total Pallet Allocated', visible: true },
    { key: 'totalReturn', label: 'Total Return', visible: true },
    { key: 'pending', label: 'Pending', visible: true },
  ]);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState({ salesmanCode: '', salesman: '', totalPalletAllocated: '', totalReturn: '', pending: '' });
  const [appliedFilter, setAppliedFilter] = useState({ salesmanCode: '', salesman: '', totalPalletAllocated: '', totalReturn: '', pending: '' });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
        setBulkActionOpen(false);
      }
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
        setColumnsDropdownOpen(false);
      }
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setMoreActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { pallets, total, isLoading, refetch } = usePallets(currentPage);
  const { salesmen, items, divisions, warehouses, isLoading: optionsLoading } = usePalletFormOptions();

  const palletData = useMemo(
    () => pallets.map((row, index) => ({ id: index, ...row })),
    [pallets],
  );

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  // Apply filters
  const currentData = palletData.filter(c =>
    (!appliedFilter.salesmanCode || String(c.salesmanCode ?? '').toLowerCase().includes(appliedFilter.salesmanCode.toLowerCase())) &&
    (!appliedFilter.salesman || String(c.salesman ?? '').toLowerCase().includes(appliedFilter.salesman.toLowerCase())) &&
    (!appliedFilter.totalPalletAllocated || String(c.totalPalletAllocated ?? '').toLowerCase().includes(appliedFilter.totalPalletAllocated.toLowerCase())) &&
    (!appliedFilter.totalReturn || String(c.totalReturn ?? '').toLowerCase().includes(appliedFilter.totalReturn.toLowerCase())) &&
    (!appliedFilter.pending || String(c.pending ?? '').toLowerCase().includes(appliedFilter.pending.toLowerCase()))
  );

  const handleSelectAll = () => {
    setSelectedRows(selectedRows.length === currentData.length ? [] : currentData.map((item) => item.id));
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  };

  const toggleColumn = (key: string) => {
    setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

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

  async function handleAddPallet(data: AddPalletFormData) {
    setIsAddLoading(true);
    try {
      await createPallet(data);
      showToast.success('Pallet added successfully');
      setIsAddOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating pallet:', error);
    } finally {
      setIsAddLoading(false);
    }
  }

  const bulkActions = [
    { label: 'Delete Selected', icon: Trash2, action: () => console.log('Delete', selectedRows) },
    { label: 'Archive Selected', icon: Archive, action: () => console.log('Archive', selectedRows) },
    { label: 'Update Status', icon: Tag, action: () => console.log('Update Status', selectedRows) },
  ];

  const getPendingBadge = (pending: number) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    if (pending === 0) {
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
    } else if (pending <= 5) {
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pl-6 pb-0 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pallet</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage pallet allocations and returns</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.length > 0 && (
            <div className="relative" ref={bulkActionRef}>
              <button
                onClick={() => setBulkActionOpen(!bulkActionOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Bulk Action
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">
                  {selectedRows.length}
                </span>
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
            onClick={() => setFilterOpen(prev => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              filterOpen || Object.values(appliedFilter).some(Boolean)
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {Object.values(appliedFilter).some(Boolean) && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                {Object.values(appliedFilter).filter(Boolean).length}
              </span>
            )}
          </button>
          <div className="relative" ref={columnsRef}>
            <button
              onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
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

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>


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
                    onClick={() => {
                      console.log('Import');
                      setMoreActionsOpen(false);
                    }}
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
            {([
              { key: 'salesmanCode', label: 'Salesman Code' },
              { key: 'salesman', label: 'Salesman' },
              { key: 'totalPalletAllocated', label: 'Total Pallet Allocated' },
              { key: 'totalReturn', label: 'Total Return' },
              { key: 'pending', label: 'Pending' },
            ] as { key: keyof typeof filterDraft; label: string }[]).map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>
                <input
                  type="text"
                  value={filterDraft[key]}
                  onChange={e => setFilterDraft(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={`Filter by ${label.toLowerCase()}...`}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ))}
            <div className="flex items-end gap-2 pb-0.5">
              <button
                onClick={() => { setAppliedFilter({ ...filterDraft }); }}
                className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  const empty = { salesmanCode: '', salesman: '', totalPalletAllocated: '', totalReturn: '', pending: '' };
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

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden transition-theme">
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
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <tr><td colSpan={visibleColumns.length + 1} className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">Loading pallets…</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={visibleColumns.length + 1} className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">No pallet records yet.</td></tr>
              ) : currentData.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-[var(--bg-secondary)] transition-colors ${
                    selectedRows.includes(item.id) ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {column.key === 'pending' ? (
                        <span className={getPendingBadge(item.pending)}>{item.pending}</span>
                      ) : (
                        item[column.key as keyof typeof item]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} total={total} perPage={rowsPerPage} onPageChange={setCurrentPage} onPerPageChange={setRowsPerPage} />
      </div>

      <PalletAdd
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddPallet}
        isLoading={isAddLoading || optionsLoading}
        salesmen={salesmen}
        items={items}
        divisions={divisions}
        warehouses={warehouses}
      />

      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleExportCancel} />
          <div className="relative bg-[var(--bg-card)] rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Export Pallet</h2>
              <button onClick={handleExportCancel} className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-6">
              <p className="text-[var(--text-secondary)]">Export pallet data in CSV or XLS format.</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'all'}
                    onChange={() => setExportType('all')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)] font-medium">All Records</span>
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
                      className="w-full max-w-xs px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">To</label>
                    <input
                      type="date"
                      value={exportToDate}
                      onChange={(e) => setExportToDate(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  <span className="text-[var(--text-primary)]">CSV (Comma Separated Value)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'xls'}
                    onChange={() => setExportFormat('xls')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)]">XLS (Microsoft Excel Compatible)</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-color)]">
              <button
                onClick={handleExportSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                Export
              </button>
              <button
                onClick={handleExportCancel}
                className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
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

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, Columns3, ChevronDown, Check, Filter, Trash2, Pencil, Eye } from 'lucide-react';
import { StockInStoreAdd } from './StockInStoreAdd';
import { StockInStoreViewDrawer } from './StockInStoreViewDrawer';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { DatePicker } from '../../components/ui/DatePicker';
import { format, parse, isValid } from 'date-fns';
import { showToast } from '../../lib/toast';
import type { StockInStoreRecord } from '../../types/StockInStore';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

function parseDateValue(value: string | undefined | null): Date | null {
  if (!value) return null;
  const raw = value.slice(0, 10);
  const parsed = parse(raw, 'yyyy-MM-dd', new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

export function StockInStoreList() {
  const [records, setRecords] = useState<StockInStoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem('rc_stock_in_store_records');
      if (saved) {
        const parsed: StockInStoreRecord[] = JSON.parse(saved);
        // Filter out any legacy mock data
        return parsed.filter(
          (r) =>
            !r.uuid.startsWith('stock-backstock-') &&
            !r.uuid.startsWith('stock-chiller-') &&
            !r.uuid.startsWith('stock-shelf-')
        );
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({ dateFrom: '', dateTo: '' });

  // Drawer states
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockInStoreRecord | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedViewRecord, setSelectedViewRecord] = useState<StockInStoreRecord | null>(null);

  const [columns, setColumns] = useState<Column[]>([
    { key: 'activityName', label: 'ACTIVITY NAME', visible: true },
    { key: 'dateFrom', label: 'DATE FROM', visible: true },
    { key: 'dateTo', label: 'DATE TO', visible: true },
  ]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rc_stock_in_store_records', JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
        setColumnsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFiltersCount = Object.values(filter).filter(Boolean).length;

  // Filtered rows
  const filteredData = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !search.trim() ||
        (r.activityName || '').toLowerCase().includes(search.toLowerCase().trim()) ||
        (r.dateFrom && r.dateFrom.includes(search.trim()));

      const matchDateFrom = !filter.dateFrom || (r.dateFrom && r.dateFrom >= filter.dateFrom);
      const matchDateTo = !filter.dateTo || (r.dateTo && r.dateTo <= filter.dateTo);

      return matchSearch && matchDateFrom && matchDateTo;
    });
  }, [records, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  const visibleColumns = columns.filter((col) => col.visible);

  const allSelected = currentData.length > 0 && selectedUuids.length === currentData.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedUuids([]);
    } else {
      setSelectedUuids(currentData.map((item) => item.uuid));
    }
  };

  const handleSelectRow = (uuid: string) => {
    setSelectedUuids((prev) => (prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]));
  };

  const toggleColumn = (key: string) => {
    setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddDrawerOpen(true);
  };

  const handleOpenEdit = (rec: StockInStoreRecord, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingItem(rec);
    setIsAddDrawerOpen(true);
  };

  const handleDeleteRecord = (rec: StockInStoreRecord, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${rec.activityName}"?`)) {
      setRecords((prev) => prev.filter((r) => r.uuid !== rec.uuid));
      setSelectedUuids((prev) => prev.filter((id) => id !== rec.uuid));
      if (selectedViewRecord?.uuid === rec.uuid) {
        setIsViewDrawerOpen(false);
        setSelectedViewRecord(null);
      }
      showToast.success('Inventory record deleted');
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedUuids.length} selected inventory records?`)) {
      setRecords((prev) => prev.filter((r) => !selectedUuids.includes(r.uuid)));
      setSelectedUuids([]);
      showToast.success('Selected inventory records deleted');
    }
  };

  const handleSaveRecord = (saved: StockInStoreRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.uuid === saved.uuid);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    if (selectedViewRecord?.uuid === saved.uuid) {
      setSelectedViewRecord(saved);
    }
  };

  const handleRowClick = (rec: StockInStoreRecord) => {
    setSelectedViewRecord(rec);
    setIsViewDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pb-0 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Stock In Store</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage store activities and inventory</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Search by activity name"
            className="w-64"
          />

          {/* Filter Button */}
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
              filterOpen || activeFiltersCount > 0
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Columns Toggle */}
          <div className="relative" ref={columnsRef}>
            <button
              onClick={() => setColumnsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
            >
              <Columns3 className="w-4 h-4" />
              Columns
              <ChevronDown className="w-4 h-4" />
            </button>
            {columnsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-20 py-1.5">
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Toggle Columns
                </div>
                {columns.map((column) => (
                  <button
                    key={column.key}
                    onClick={() => toggleColumn(column.key)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                  >
                    <span>{column.label}</span>
                    {column.visible && <Check className="w-4 h-4 text-primary-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add / Create Inventory Button */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Inventory
          </button>
        </div>
      </div>

      {/* Filter Accordion */}
      {filterOpen && (
        <div className="mx-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date From</label>
            <DatePicker
              selected={parseDateValue(filter.dateFrom)}
              onChange={(d) => setFilter((prev) => ({ ...prev, dateFrom: d ? format(d, 'yyyy-MM-dd') : '' }))}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date To</label>
            <DatePicker
              selected={parseDateValue(filter.dateTo)}
              onChange={(d) => setFilter((prev) => ({ ...prev, dateTo: d ? format(d, 'yyyy-MM-dd') : '' }))}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
              minDate={parseDateValue(filter.dateFrom) ?? undefined}
            />
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <button
              onClick={() => {
                setFilter({ dateFrom: '', dateTo: '' });
                setFilterOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk action banner */}
      {selectedUuids.length > 0 && (
        <div className="mx-6 flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
          <span>{selectedUuids.length} inventory record{selectedUuids.length > 1 ? 's' : ''} selected</span>
          <button
            onClick={handleDeleteSelected}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden transition-theme mx-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-color)]">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      <Search className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] w-28">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="px-4 py-12 text-center text-[var(--text-muted)] text-sm">
                    {search || activeFiltersCount > 0
                      ? 'No inventory activities match your filters.'
                      : 'No inventory activities yet. Click "+ Add Inventory" to create one.'}
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.uuid}
                    onClick={() => handleRowClick(item)}
                    className={`hover:bg-[var(--bg-secondary)]/60 transition-colors cursor-pointer ${
                      selectedUuids.includes(item.uuid) ? 'bg-primary-50/60 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUuids.includes(item.uuid)}
                        onChange={() => handleSelectRow(item.uuid)}
                        className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </td>
                    {visibleColumns.map((column) => {
                      if (column.key === 'activityName') {
                        return (
                          <td key={column.key} className="px-4 py-3.5 text-sm font-semibold text-[var(--text-primary)]">
                            {item.activityName}
                          </td>
                        );
                      }
                      if (column.key === 'dateFrom') {
                        return (
                          <td key={column.key} className="px-4 py-3.5 text-sm font-mono text-[var(--text-secondary)]">
                            {item.dateFrom || '—'}
                          </td>
                        );
                      }
                      if (column.key === 'dateTo') {
                        return (
                          <td key={column.key} className="px-4 py-3.5 text-sm font-mono text-[var(--text-secondary)]">
                            {item.dateTo || '—'}
                          </td>
                        );
                      }
                      return (
                        <td key={column.key} className="px-4 py-3.5 text-sm text-[var(--text-primary)]">
                          {String(item[column.key as keyof StockInStoreRecord] ?? '—')}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRowClick(item)}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-primary-600 rounded-md hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-blue-600 rounded-md hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteRecord(item, e)}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-red-600 rounded-md hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          currentPage={currentPage}
          totalPages={totalPages}
          total={filteredData.length}
          perPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onPerPageChange={(n) => {
            setRowsPerPage(n);
            setCurrentPage(1);
          }}
          hasLoaded={true}
        />
      </div>

      {/* Add / Edit Drawer */}
      <StockInStoreAdd
        isOpen={isAddDrawerOpen}
        editItem={editingItem}
        onClose={() => {
          setIsAddDrawerOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveRecord}
      />

      {/* View Drawer */}
      <StockInStoreViewDrawer
        isOpen={isViewDrawerOpen}
        uuid={selectedViewRecord?.uuid ?? null}
        selectedItem={selectedViewRecord}
        records={records}
        onSelect={(_uuid, rec) => setSelectedViewRecord(rec)}
        onEdit={(rec) => {
          setEditingItem(rec);
          setIsAddDrawerOpen(true);
        }}
        onDelete={(rec) => handleDeleteRecord(rec)}
        pageSize={rowsPerPage}
        onClose={() => {
          setIsViewDrawerOpen(false);
          setSelectedViewRecord(null);
        }}
      />
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

// Sample journey plan data
const journeyPlansData = [
  { id: 1, code: 'JP001', name: 'Downtown Route A', salesman: 'John Smith', route: 'Route A', day: 'Monday', customers: 15, status: 'Active' },
  { id: 2, code: 'JP002', name: 'Mall Circuit', salesman: 'Jane Doe', route: 'Route B', day: 'Tuesday', customers: 12, status: 'Active' },
  { id: 3, code: 'JP003', name: 'Industrial Zone', salesman: 'Mike Johnson', route: 'Route C', day: 'Wednesday', customers: 8, status: 'Active' },
  { id: 4, code: 'JP004', name: 'Suburban Run', salesman: 'Sarah Williams', route: 'Route D', day: 'Thursday', customers: 20, status: 'Inactive' },
  { id: 5, code: 'JP005', name: 'City Center', salesman: 'Tom Brown', route: 'Route E', day: 'Friday', customers: 18, status: 'Active' },
  { id: 6, code: 'JP006', name: 'East Side Coverage', salesman: 'Emily Davis', route: 'Route F', day: 'Monday', customers: 10, status: 'Active' },
  { id: 7, code: 'JP007', name: 'West District', salesman: 'David Wilson', route: 'Route G', day: 'Tuesday', customers: 14, status: 'Active' },
  { id: 8, code: 'JP008', name: 'North Area', salesman: 'Lisa Anderson', route: 'Route H', day: 'Wednesday', customers: 9, status: 'Inactive' },
  { id: 9, code: 'JP009', name: 'South Zone', salesman: 'Robert Taylor', route: 'Route I', day: 'Thursday', customers: 16, status: 'Active' },
  { id: 10, code: 'JP010', name: 'Premium Clients', salesman: 'Jennifer Martinez', route: 'Route J', day: 'Friday', customers: 6, status: 'Active' },
];

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

export function JourneyPlanList() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const bulkActionRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Export modal state
  const [exportType, setExportType] = useState<'all' | 'specific'>('specific');
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xls' | ''>('');

  const [columns, setColumns] = useState<Column[]>([
    { key: 'code', label: 'Code', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'salesman', label: 'Salesman', visible: true },
    { key: 'route', label: 'Route', visible: true },
    { key: 'day', label: 'Day', visible: true },
    { key: 'customers', label: 'Customers', visible: true },
    { key: 'status', label: 'Status', visible: true },
  ]);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState({ code: '', name: '', salesman: '', route: '', day: '', customers: '' });
  const [appliedFilter, setAppliedFilter] = useState({ code: '', name: '', salesman: '', route: '', day: '', customers: '' });

  // Close dropdowns when clicking outside
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

  const totalPages = Math.ceil(journeyPlansData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Apply filters
  const filteredData = journeyPlansData.filter(c =>
    (!appliedFilter.code || String(c.code ?? '').toLowerCase().includes(appliedFilter.code.toLowerCase())) &&
    (!appliedFilter.name || String(c.name ?? '').toLowerCase().includes(appliedFilter.name.toLowerCase())) &&
    (!appliedFilter.salesman || String(c.salesman ?? '').toLowerCase().includes(appliedFilter.salesman.toLowerCase())) &&
    (!appliedFilter.route || String(c.route ?? '').toLowerCase().includes(appliedFilter.route.toLowerCase())) &&
    (!appliedFilter.day || String(c.day ?? '').toLowerCase().includes(appliedFilter.day.toLowerCase())) &&
    (!appliedFilter.customers || String(c.customers ?? '').toLowerCase().includes(appliedFilter.customers.toLowerCase()))
  );
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedRows.length === currentData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentData.map((item) => item.id));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
    );
  };

  const visibleColumns = columns.filter((col) => col.visible);

  const handleExport = () => {
    setExportModalOpen(true);
  };

  const handleExportSubmit = () => {
    console.log('Exporting journey plans...', {
      type: exportType,
      fromDate: exportFromDate,
      toDate: exportToDate,
      format: exportFormat,
    });
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

  const handleImport = () => {
    console.log('Importing journey plans...');
  };

  const handleCreate = () => {
    navigate('/journey-plan/add');
  };

  const bulkActions = [
    { label: 'Delete Selected', icon: Trash2, action: () => console.log('Delete', selectedRows) },
    { label: 'Archive Selected', icon: Archive, action: () => console.log('Archive', selectedRows) },
    { label: 'Update Status', icon: Tag, action: () => console.log('Update Status', selectedRows) },
  ];

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium ';
    if (status === 'Active') {
      return `${baseClasses} `;
    }
    return `${baseClasses} `;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pl-6 pb-0 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Journey Plans</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage salesman journey plans and routes
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk Action Dropdown */}
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

          {/* Columns Dropdown */}
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

          {/* Create Button */}
          <Link
            to="/journey-plan/add"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>

          {/* More Actions Dropdown */}
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
                      handleExport();
                      setMoreActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      handleImport();
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
              { key: 'code', label: 'Code' },
              { key: 'name', label: 'Name' },
              { key: 'salesman', label: 'Salesman' },
              { key: 'route', label: 'Route' },
              { key: 'day', label: 'Day' },
              { key: 'customers', label: 'Customers' },
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
                  const empty = { code: '', name: '', salesman: '', route: '', day: '', customers: '' };
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

      {/* Table */}
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
              {currentData.map((item) => (
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
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-[var(--text-primary)]"
                    >
                      {column.key === 'status' ? (
                        <span className={getStatusBadge(item.status)}>
                          {item.status}
                        </span>
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-4">
              {startIndex + 1}-{Math.min(endIndex, journeyPlansData.length)} of {journeyPlansData.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm text-[var(--text-primary)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleExportCancel}
          />
          <div className="relative bg-[var(--bg-card)] rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Export Journey Plans
              </h2>
              <button
                onClick={handleExportCancel}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              <p className="text-[var(--text-secondary)]">
                Export journey plan data in CSV or XLS format.
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'all'}
                    onChange={() => setExportType('all')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)] font-medium">
                    All Journey Plans
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'specific'}
                    onChange={() => setExportType('specific')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)] font-medium">
                    Specific Date Range
                  </span>
                </label>
              </div>

              {exportType === 'specific' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={exportFromDate}
                      onChange={(e) => setExportFromDate(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      To
                    </label>
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
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Export As :
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)]">
                    CSV (Comma Separated Value)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'xls'}
                    onChange={() => setExportFormat('xls')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="text-[var(--text-primary)]">
                    XLS (Microsoft Excel Compatible)
                  </span>
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

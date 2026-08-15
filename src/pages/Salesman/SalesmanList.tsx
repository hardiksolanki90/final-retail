import { useState, useRef, useEffect } from 'react';
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
  Pencil,
} from 'lucide-react';
import SalesmanAdd from './SalesmanAdd';
import { SalesmanViewDrawer } from './SalesmanViewDrawer';
import { useSalesman } from '../../providers/SalesmanProvider';
import type { Salesman } from '../../types/Salesman';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

export function SalesmanList() {
  // ── Context ──────────────────────────────────────────────────────────────
  const {
    salesmanData,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    searchTerm,
    setSearchTerm,
    selectedRowKeys,
    setSelectedRowKeys,
    handleDeleteWithConfirmation,
    handleBulkAction,
    refetchSalesmen,
    isSalesmanModalVisible: isAddOpen,
    setIsSalesmanModalVisible: setIsAddOpen,
  } = useSalesman();

  const salesmen: Salesman[] = Array.isArray(salesmanData?.data?.salesmans)
    ? salesmanData.data.salesmans
    : Array.isArray(salesmanData?.data?.data)
      ? salesmanData.data.data
      : Array.isArray(salesmanData?.data)
        ? salesmanData.data
        : [];
  const meta = salesmanData?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.per_page) : 1;

  // ── Local UI State ────────────────────────────────────────────────────────
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedSalesman, setSelectedSalesman] = useState<Salesman | null>(null);
  const [viewSalesman, setViewSalesman] = useState<Salesman | null>(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');

  // Export state
  const [exportType, setExportType] = useState<'all' | 'specific'>('specific');
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xls' | ''>('');

  const [columns, setColumns] = useState<Column[]>([
    { key: 'code', label: 'Code', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'mobile', label: 'Mobile', visible: true },
    { key: 'route', label: 'Route', visible: true },
    { key: 'warehouse', label: 'Warehouse', visible: true },
    { key: 'status', label: 'Status', visible: true },
  ]);

  const bulkActionRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // ── Close dropdowns on outside click ────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node))
        setBulkActionOpen(false);
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node))
        setColumnsDropdownOpen(false);
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node))
        setMoreActionsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const visibleColumns = columns.filter(c => c.visible);

  const toggleColumn = (key: string) =>
    setColumns(prev => prev.map(col => col.key === key ? { ...col, visible: !col.visible } : col));




  const allSelected = salesmen.length > 0 && selectedRowKeys.length === salesmen.length;

  const handleSelectAll = () =>
    setSelectedRowKeys(allSelected ? [] : salesmen.map(s => s.uuid!));

  const handleSelectRow = (uuid: string) =>
    setSelectedRowKeys(
      selectedRowKeys.includes(uuid) ? selectedRowKeys.filter(k => k !== uuid) : [...selectedRowKeys, uuid]
    );

  const applySearch = () => { setSearchTerm(searchDraft); setCurrentPage(1); };
  const clearSearch = () => { setSearchDraft(''); setSearchTerm(''); setCurrentPage(1); setFilterOpen(false); };

  const handleEditClick = (salesman: Salesman) => { setSelectedSalesman(salesman); setIsAddOpen(true); };
  const handleDrawerClose = () => { setIsAddOpen(false); setSelectedSalesman(null); };
  const handleSaved = () => { handleDrawerClose(); refetchSalesmen(); };

  const handleExportSubmit = () => {
    console.log('Exporting…', { exportType, exportFromDate, exportToDate, exportFormat });
    setExportModalOpen(false); setExportType('specific'); setExportFromDate(''); setExportToDate(''); setExportFormat('');
  };

  const bulkActionItems = [
    { label: 'Delete Selected', icon: Trash2, action: () => { handleBulkAction('delete'); setBulkActionOpen(false); } },
    { label: 'Activate Selected', icon: Archive, action: () => { handleBulkAction('activate'); setBulkActionOpen(false); } },
    { label: 'Deactivate Selected', icon: Tag, action: () => { handleBulkAction('deactivate'); setBulkActionOpen(false); } },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pb-0 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Salesman</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your sales team</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRowKeys.length > 0 && (
            <div className="relative" ref={bulkActionRef}>
              <button onClick={() => setBulkActionOpen(!bulkActionOpen)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
                Bulk Action
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">{selectedRowKeys.length}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {bulkActionOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    {bulkActionItems.map(item => (
                      <button key={item.label} onClick={item.action} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                        <item.icon className="w-4 h-4" />{item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setFilterOpen(prev => !prev)} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${filterOpen || searchTerm ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}>
            <Filter className="w-4 h-4" />Filter
            {searchTerm && <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">1</span>}
          </button>

          <div className="relative" ref={columnsRef}>
            <button onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
              <Columns3 className="w-4 h-4" />Columns<ChevronDown className="w-4 h-4" />
            </button>
            {columnsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-20">
                <div className="py-1">
                  {columns.map(column => (
                    <button key={column.key} onClick={() => toggleColumn(column.key)} className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                      <span>{column.label}</span>
                      {column.visible && <Check className="w-4 h-4 text-primary-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => { setSelectedSalesman(null); setIsAddOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" />Create
          </button>

          <div className="relative" ref={moreActionsRef}>
            <button onClick={() => setMoreActionsOpen(!moreActionsOpen)} className="inline-flex items-center justify-center p-2 text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
              <Menu className="w-5 h-5" /><ChevronDown className="w-4 h-4" />
            </button>
            {moreActionsOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-20">
                <div className="py-1">
                  <button onClick={() => { setExportModalOpen(true); setMoreActionsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"><Download className="w-4 h-4" />Export</button>
                  <button onClick={() => { console.log('Import'); setMoreActionsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"><Upload className="w-4 h-4" />Import</button>
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
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Search</label>
              <input type="text" value={searchDraft} onChange={e => setSearchDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && applySearch()} placeholder="Search by name, code, phone…" className="px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <button onClick={applySearch} className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">Apply</button>
              <button onClick={clearSearch} className="px-4 py-2 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg transition-colors">Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden transition-theme relative min-h-[400px] mx-6">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="text-red-500 font-medium">Error loading salesmen: {error.message}</div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Code</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Route</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Warehouse</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {!isLoading && salesmen.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[var(--text-muted)]">No salesmen found.</td></tr>
              )}
              {salesmen.map((salesman: any) => (
                <tr
                  key={salesman?.uuid}
                  onClick={() => { setViewSalesman(salesman); setViewDrawerOpen(true); }}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input type="checkbox" checked={selectedRowKeys.includes(salesman?.uuid ?? "")} onChange={(e) => { e.stopPropagation(); handleSelectRow(salesman?.uuid ?? ""); }} onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500" />
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-[var(--text-secondary)]">{salesman?.salesmanCode ?? salesman?.code}</span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{salesman?.firstname ?? salesman?.salesmanName} {salesman?.lastname ?? ''}</span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-[var(--text-secondary)]">{salesman?.phone ?? '—'}</span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-[var(--text-secondary)]">{salesman?.route?.name ?? salesman?.route?.route_name ?? '—'}</span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-[var(--text-secondary)]">{salesman?.warehouse?.name ?? '—'}</span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 group-hover:shadow-md"
                        onClick={(e) => { e.stopPropagation(); handleEditClick(salesman); }}
                      >
                        <Pencil size={14} strokeWidth={2.5} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 group-hover:shadow-md"
                        onClick={(e) => { e.stopPropagation(); handleDeleteWithConfirmation(salesman?.uuid ?? ""); }}
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>Rows per page:</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500">
              {[10, 15, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {meta && <span className="ml-4">{((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, meta.total)} of {meta.total}</span>}
          </div>
          <div className="flex items-center gap-1">
            {(['First', 'Prev', 'Next', 'Last'] as const).map(label => {
              const disabled = label === 'First' || label === 'Prev' ? currentPage === 1 : currentPage === totalPages || totalPages === 0;
              const onClick = () => {
                if (label === 'First') setCurrentPage(1);
                else if (label === 'Prev') setCurrentPage(Math.max(currentPage - 1, 1));
                else if (label === 'Next') setCurrentPage(Math.min(currentPage + 1, totalPages));
                else setCurrentPage(totalPages);
              };
              return <button key={label} onClick={onClick} disabled={disabled} className="px-3 py-1 text-sm rounded border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{label}</button>;
            })}
            <span className="px-3 py-1 text-sm text-[var(--text-primary)]">Page {currentPage} of {totalPages || 1}</span>
          </div>
        </div>
      </div>

      {/* View Drawer */}
      <SalesmanViewDrawer isOpen={viewDrawerOpen} onClose={() => { setViewDrawerOpen(false); setViewSalesman(null); }} data={viewSalesman} />

      {/* Add / Edit Drawer */}
      <SalesmanAdd
        isOpen={isAddOpen}
        onClose={handleDrawerClose}
        data={selectedSalesman}
        onEvent={(event) => { if (event.eventType === 'SalesmanSaved') handleSaved(); }}
      />

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setExportModalOpen(false)} />
          <div className="relative bg-[var(--bg-card)] rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Export Salesman</h2>
              <button onClick={() => setExportModalOpen(false)} className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="space-y-3">
                {(['all', 'specific'] as const).map(t => (
                  <label key={t} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="exportType" checked={exportType === t} onChange={() => setExportType(t)} className="w-5 h-5 text-primary-600" />
                    <span className="text-[var(--text-primary)] font-medium capitalize">{t} Salesman</span>
                  </label>
                ))}
              </div>
              {exportType === 'specific' && (
                <div className="grid grid-cols-2 gap-4">
                  {[['From', exportFromDate, setExportFromDate], ['To', exportToDate, setExportToDate]].map(([label, val, set]) => (
                    <div key={label as string}>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{label as string}</label>
                      <input type="date" value={val as string} onChange={e => (set as any)(e.target.value)} className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Export As:</label>
                {(['csv', 'xls'] as const).map(f => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="exportFormat" checked={exportFormat === f} onChange={() => setExportFormat(f)} className="w-5 h-5 text-primary-600" />
                    <span className="text-[var(--text-primary)] uppercase">{f}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-color)]">
              <button onClick={handleExportSubmit} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">Export</button>
              <button onClick={() => setExportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

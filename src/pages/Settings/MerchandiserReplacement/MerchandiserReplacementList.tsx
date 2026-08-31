import { useState, useRef, useEffect } from 'react';
import { Filter, Plus, RefreshCw, Columns3, ChevronDown, Check, Menu, Download, Upload, Pencil, Trash2 } from 'lucide-react';
import { MerchandiserReplacementAdd } from './MerchandiserReplacementAdd';
import { useMerchandiserReplacement } from '../../../providers/MerchandiserReplacementProvider';
import { createMerchandiserReplacement, updateMerchandiserReplacement } from '../../../api/MerchandiserReplacementApi';
import type { MerchandiserReplacementFormData } from '../../../types/MerchandiserReplacement';

interface Column { key: string; label: string; visible: boolean; }

export function MerchandiserReplacementList() {
  const {
    data: replacements, meta, isLoading, error, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, handleDeleteWithConfirmation, refetch,
    addDrawerOpen, setAddDrawerOpen, editingItem, setEditingItem, salesmanOptions,
  } = useMerchandiserReplacement();

  const totalPages = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;

  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    { key: 'oldSalesman', label: 'Old Salesman', visible: true },
    { key: 'newSalesman', label: 'New Salesman', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'addedOn', label: 'Added On', visible: true },
  ]);

  const columnsRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) setColumnsDropdownOpen(false);
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target as Node)) setMoreActionsOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const visibleColumns = columns.filter(c => c.visible);
  const toggleColumn = (key: string) => setColumns(prev => prev.map(col => col.key === key ? { ...col, visible: !col.visible } : col));

  const allSelected = replacements.length > 0 && selectedRowKeys.length === replacements.length;
  const handleSelectAll = () => setSelectedRowKeys(allSelected ? [] : replacements.map(c => c.uuid));
  const handleSelectRow = (id: string) => setSelectedRowKeys(selectedRowKeys.includes(id) ? selectedRowKeys.filter(k => k !== id) : [...selectedRowKeys, id]);

  const handleEditClick = (item: any) => { setEditingItem(item); setAddDrawerOpen(true); };
  const handleDrawerClose = () => { setAddDrawerOpen(false); setEditingItem(null); };
  const handleSaved = () => { handleDrawerClose(); refetch(); };

  const handleFormSubmit = async (data: MerchandiserReplacementFormData) => {
    if (editingItem) {
      await updateMerchandiserReplacement(editingItem.uuid, data);
    } else {
      await createMerchandiserReplacement(data);
    }
    handleSaved();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pb-0 pt-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[var(--text-primary)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Merchandiser Replacement</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage merchandiser replacements and substitutions</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterOpen(prev => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              filterOpen ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Filter className="w-4 h-4" />Filter
          </button>
          <div className="relative" ref={columnsRef}>
            <button onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
              <Columns3 className="w-4 h-4" />Columns<ChevronDown className="w-4 h-4" />
            </button>
            {columnsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-20">
                <div className="py-1">
                  {columns.map(col => (
                    <button key={col.key} onClick={() => toggleColumn(col.key)} className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                      <span>{col.label}</span>{col.visible && <Check className="w-4 h-4 text-primary-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => { setEditingItem(null); setAddDrawerOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" />Create
          </button>
          <div className="relative" ref={moreActionsRef}>
            <button onClick={() => setMoreActionsOpen(!moreActionsOpen)} className="inline-flex items-center justify-center p-2 text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
              <Menu className="w-5 h-5" /><ChevronDown className="w-4 h-4" />
            </button>
            {moreActionsOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-20">
                <div className="py-1">
                  <button onClick={() => setMoreActionsOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"><Download className="w-4 h-4" />Export</button>
                  <button onClick={() => setMoreActionsOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"><Upload className="w-4 h-4" />Import</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel (placeholder) */}
      {filterOpen && (
        <div className="mx-6 mb-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-5 py-4 shadow-sm">
          <p className="text-sm text-[var(--text-secondary)]">Filter options coming soon.</p>
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
            <div className="text-red-500 font-medium">Error: {error.message}</div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500" />
                </th>
                {visibleColumns.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{col.label}</th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {!isLoading && replacements.length === 0 && (
                <tr><td colSpan={visibleColumns.length + 2} className="px-4 py-12 text-center text-[var(--text-muted)]">No replacements found.</td></tr>
              )}
              {replacements.map(item => (
                <tr key={item.uuid} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input type="checkbox" checked={selectedRowKeys.includes(item.uuid)} onChange={() => handleSelectRow(item.uuid)} className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500" />
                  </td>
                  {visibleColumns.map(col => (
                    <td key={col.key} className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {col.key === 'oldSalesman' && (item.oldSalesman?.name ?? `ID: ${item.oldSalesmanId}`)}
                      {col.key === 'newSalesman' && (item.newSalesman?.name ?? `ID: ${item.newSalesmanId}`)}
                      {col.key === 'type' && item.type}
                      {col.key === 'addedOn' && item.addedOn}
                    </td>
                  ))}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200" onClick={() => handleEditClick(item)}>
                        <Pencil size={14} strokeWidth={2.5} /><span>Edit</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200" onClick={() => handleDeleteWithConfirmation(item.uuid)}>
                        <Trash2 size={14} strokeWidth={2.5} /><span>Delete</span>
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
            {meta && <span className="ml-4">{((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, total)} of {total}</span>}
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

      <MerchandiserReplacementAdd
        isOpen={addDrawerOpen}
        onClose={handleDrawerClose}
        onSubmit={handleFormSubmit}
        initialData={editingItem ? { oldSalesmanId: editingItem.oldSalesmanId, newSalesmanId: editingItem.newSalesmanId, type: editingItem.type, addedOn: editingItem.addedOn } : undefined}
        salesmanOptions={salesmanOptions}
      />
    </div>
  );
}

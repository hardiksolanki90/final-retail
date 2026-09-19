
import { useState, useRef, useEffect } from 'react';
import {
  Filter,
  Plus, Shield, Columns3, Download, Upload, ChevronDown, Check, X, Menu
} from 'lucide-react';
import { UsersRolesAdd } from './UsersRolesAdd';
import { UserAdd } from './UserAdd';
import { UsersList } from './UsersList';
import { Pagination } from '../../../components/ui/Pagination';
import { Tabs } from '../../../components/ui/Tabs';
import { useRoles, useRoleMutations } from '../../../hooks/UsersRoles/useRoles';
import type { UserRoleFormData } from '../../../types/UsersRoles';

interface Column { key: string; label: string; visible: boolean; }

export function UsersRolesList() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('users');
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [userAddDrawerOpen, setUserAddDrawerOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  const [exportType, setExportType] = useState<'all' | 'specific'>('specific');
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xls' | ''>('');

  const [columns, setColumns] = useState<Column[]>([
    { key: 'code', label: 'Code', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
  ]);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState({ code: '', name: '', description: '' });
  const [appliedFilter, setAppliedFilter] = useState({ code: '', name: '', description: '' });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  const { roles, total, isLoading } = useRoles(currentPage);
  const { createMutation } = useRoleMutations();

  const roleData = roles.map((r) => ({
    id: r.uuid ?? '',
    code: r.code,
    name: r.name,
    description: r.description ?? '—',
  }));

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  // Apply filters
  const currentData = roleData.filter(c =>
    (!appliedFilter.code || String(c.code ?? '').toLowerCase().includes(appliedFilter.code.toLowerCase())) &&
    (!appliedFilter.name || String(c.name ?? '').toLowerCase().includes(appliedFilter.name.toLowerCase())) &&
    (!appliedFilter.description || String(c.description ?? '').toLowerCase().includes(appliedFilter.description.toLowerCase()))
  );

  const handleSelectAll = () => {
    setSelectedRows(selectedRows.length === currentData.length ? [] : currentData.map((item) => item.id));
  };

  const handleSelectRow = (id: string) => {
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

  const handleExportSubmit = () => {
    console.log('Exporting user roles...', { type: exportType, fromDate: exportFromDate, toDate: exportToDate, format: exportFormat });
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

  const handleImport = () => console.log('Importing user roles...');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pl-6 pb-0 pt-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[var(--text-primary)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users & Roles</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Manage users & roles
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'roles' && (
            <>
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
            onClick={() => setAddDrawerOpen(true)}
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
                    onClick={() => { setExportModalOpen(true); setMoreActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => { handleImport(); setMoreActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </button>
                </div>
              </div>
            )}
          </div>
            </>
          )}
          {activeTab === 'users' && (
            <button
              onClick={() => setUserAddDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create User
            </button>
          )}
        </div>
      </div>

      <div className="px-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              key: 'users',
              label: 'Users',
              content: <UsersList />
            },
            {
              key: 'roles',
              label: 'Roles',
              content: (
                <div className="mt-6 space-y-6">

          {/* Filter Accordion */}
          {filterOpen && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-5 py-4 shadow-sm">
              <div className="flex flex-wrap items-end gap-3">
            {([
              { key: 'code', label: 'Code' },
              { key: 'name', label: 'Name' },
              { key: 'description', label: 'Description' },
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
                  const empty = { code: '', name: '', description: '' };
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
              {isLoading ? (
                <tr><td colSpan={visibleColumns.length + 1} className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">Loading roles…</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={visibleColumns.length + 1} className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">No roles yet.</td></tr>
              ) : currentData.map((role) => (
                <tr
                  key={role.id}
                  className={`hover:bg-[var(--bg-secondary)] transition-colors ${
                    selectedRows.includes(role.id) ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(role.id)}
                      onChange={() => handleSelectRow(role.id)}
                      className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {role[column.key as keyof typeof role]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} total={total} perPage={rowsPerPage} onPageChange={setCurrentPage} onPerPageChange={setRowsPerPage} />
          </div>
                </div>
              )
            }
          ]}
        />
      </div>

      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleExportCancel} />
          <div className="relative bg-[var(--bg-card)] rounded-lg shadow-xl w-full max-w-lg mx-4 text-[var(--text-primary)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-semibold">Export User Roles</h2>
              <button
                onClick={handleExportCancel}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-6">
              <p className="text-[var(--text-secondary)]">Export user role data in CSV or XLS format.</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'all'}
                    onChange={() => setExportType('all')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="font-medium">All User Roles</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'specific'}
                    onChange={() => setExportType('specific')}
                    className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                  />
                  <span className="font-medium">Specific Date Range</span>
                </label>
              </div>

              {exportType === 'specific' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">From</label>
                    <input
                      type="date"
                      value={exportFromDate}
                      onChange={(e) => setExportFromDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">To</label>
                    <input
                      type="date"
                      value={exportToDate}
                      onChange={(e) => setExportToDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Export As :</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                      className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                    />
                    <span>CSV</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'xls'}
                      onChange={() => setExportFormat('xls')}
                      className="w-5 h-5 text-primary-600 border-[var(--border-color)] focus:ring-primary-500"
                    />
                    <span>XLS</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-color)]">
              <button
                onClick={handleExportCancel}
                className="px-4 py-2 text-sm font-medium border border-[var(--border-color)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExportSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      <UsersRolesAdd
        isOpen={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onSubmit={async (data: UserRoleFormData) => {
          await createMutation.mutateAsync(data);
        }}
      />

      <UserAdd
        isOpen={userAddDrawerOpen}
        onClose={() => setUserAddDrawerOpen(false)}
        onSubmit={async (data) => {
          console.log('Creating user...', data);
        }}
        rolesOptions={roles.map(r => ({ value: r.id ?? '', label: r.name }))}
      />
    </div>
  );
}

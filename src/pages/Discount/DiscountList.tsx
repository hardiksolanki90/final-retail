import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Columns3,
  ChevronDown,
  Check,
  Trash2,
  Archive,
  Tag,
  Pencil,
} from 'lucide-react';
import { useRules } from '../../hooks/usePricingPromotionRules';
import { TableLoadingRow } from '../../components/ui/TableLoadingRow';
import { TableEmptyRow } from '../../components/ui/TableEmptyRow';
import { Pagination } from '../../components/ui/Pagination';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

const OFFER_TYPE_LABELS: Record<string, string> = {
  free_goods: 'Free Goods',
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
};

export function DiscountList() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const bulkActionRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  const { rules, total, isLoading, bulkAction } = useRules('discount', currentPage);

  const rowsData = useMemo(
    () =>
      rules.map((r) => ({
        id: r.uuid ?? '',
        name: r.name,
        customer: r.customerName ?? '—',
        itemGroup: r.itemGroupName ?? '—',
        offer: r.offerType ? OFFER_TYPE_LABELS[r.offerType] ?? r.offerType : '—',
        itemCount: r.itemCount ?? 0,
        dateRange: `${r.startDate} → ${r.endDate}`,
        status: r.status ? 'Active' : 'Inactive',
      })),
    [rules],
  );

  const [columns, setColumns] = useState<Column[]>([
    { key: 'name', label: 'Name', visible: true },
    { key: 'customer', label: 'Customer', visible: true },
    { key: 'itemGroup', label: 'Item Group', visible: true },
    { key: 'offer', label: 'Offer Type', visible: true },
    { key: 'itemCount', label: 'Items', visible: true },
    { key: 'dateRange', label: 'Date Range', visible: true },
    { key: 'status', label: 'Status', visible: true },
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

  const bulkActions = [
    { label: 'Activate Selected', icon: Tag, action: () => { bulkAction({ uuids: selectedRows, action: 'activate' }); setSelectedRows([]); } },
    { label: 'Deactivate Selected', icon: Archive, action: () => { bulkAction({ uuids: selectedRows, action: 'deactivate' }); setSelectedRows([]); } },
    { label: 'Delete Selected', icon: Trash2, action: () => { bulkAction({ uuids: selectedRows, action: 'delete' }); setSelectedRows([]); } },
  ];

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    return status === 'Active'
      ? `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
      : `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pl-6 pb-0 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Discount</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage customer/item-group discounts</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.length > 0 && (
            <div className="relative" ref={bulkActionRef}>
              <button
                onClick={() => setBulkActionOpen(!bulkActionOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
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
                        onClick={() => { action.action(); setBulkActionOpen(false); }}
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

          <Link
            to="/discount/add"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>
      </div>

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
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <TableLoadingRow colSpan={visibleColumns.length + 2} label="Loading discounts…" />
              ) : rowsData.length === 0 ? (
                <TableEmptyRow colSpan={visibleColumns.length + 2} label="No discounts yet." />
              ) : rowsData.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-[var(--bg-secondary)] transition-colors ${selectedRows.includes(item.id) ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
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
                    <td key={column.key} className="px-4 py-3 text-sm text-[var(--text-primary)] whitespace-nowrap">
                      {column.key === 'status' ? (
                        <span className={getStatusBadge(item.status)}>{item.status}</span>
                      ) : (
                        item[column.key as keyof typeof item]
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap">
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
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} total={total} perPage={rowsPerPage} onPageChange={setCurrentPage} onPerPageChange={setRowsPerPage} />
      </div>
    </div>
  );
}

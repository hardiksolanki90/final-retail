
import { useState } from 'react';
import {
  Filter,
  Plus, Columns3, ChevronDown, Check, Menu
} from 'lucide-react';

const competitorInfosData = [
  { id: 1, competitorName: 'Competitor A', competitorBrand: 'Brand X', productName: 'Product 1', price: 49.99, observationDate: '2024-01-15', status: 'Active' },
  { id: 2, competitorName: 'Competitor B', competitorBrand: 'Brand Y', productName: 'Product 2', price: 39.99, observationDate: '2024-01-16', status: 'Active' },
  { id: 3, competitorName: 'Competitor C', competitorBrand: 'Brand Z', productName: 'Product 3', price: 59.99, observationDate: '2024-01-17', status: 'Active' },
  { id: 4, competitorName: 'Competitor A', competitorBrand: 'Brand X', productName: 'Product 4', price: 44.99, observationDate: '2024-01-18', status: 'Inactive' },
  { id: 5, competitorName: 'Competitor D', competitorBrand: 'Brand W', productName: 'Product 5', price: 69.99, observationDate: '2024-01-19', status: 'Active' },
];

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

export function CompetitorInfoList() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);

  const [columns, setColumns] = useState<Column[]>([
    { key: 'competitorName', label: 'Competitor Name', visible: true },
    { key: 'competitorBrand', label: 'Competitor Brand', visible: true },
    { key: 'productName', label: 'Product Name', visible: true },
    { key: 'price', label: 'Price', visible: true },
    { key: 'observationDate', label: 'Observation Date', visible: true },
    { key: 'status', label: 'Status', visible: true },
  ]);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState({ competitorName: '', competitorBrand: '', productName: '', price: '', observationDate: '', status: '' });
  const [appliedFilter, setAppliedFilter] = useState({ competitorName: '', competitorBrand: '', productName: '', price: '', observationDate: '', status: '' });

  const totalPages = Math.ceil(competitorInfosData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Apply filters
  const filteredData = competitorInfosData.filter(c =>
    (!appliedFilter.competitorName || String(c.competitorName ?? '').toLowerCase().includes(appliedFilter.competitorName.toLowerCase())) &&
    (!appliedFilter.competitorBrand || String(c.competitorBrand ?? '').toLowerCase().includes(appliedFilter.competitorBrand.toLowerCase())) &&
    (!appliedFilter.productName || String(c.productName ?? '').toLowerCase().includes(appliedFilter.productName.toLowerCase())) &&
    (!appliedFilter.price || String(c.price ?? '').toLowerCase().includes(appliedFilter.price.toLowerCase())) &&
    (!appliedFilter.observationDate || String(c.observationDate ?? '').toLowerCase().includes(appliedFilter.observationDate.toLowerCase())) &&
    (!appliedFilter.status || String(c.status ?? '').toLowerCase().includes(appliedFilter.status.toLowerCase()))
  );
  const currentData = filteredData.slice(startIndex, endIndex);
  const visibleColumns = columns.filter((col) => col.visible);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pl-6 pb-0 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Competitor Information</h1>
          <p className="text-[var(--text-secondary)] mt-1">Track competitor products and pricing</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <div className="relative">
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
            onClick={() => console.log('Create')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

            {/* Filter Accordion */}
      {filterOpen && (
        <div className="mx-6 mb-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            {([
              { key: 'competitorName', label: 'Competitor Name' },
              { key: 'competitorBrand', label: 'Competitor Brand' },
              { key: 'productName', label: 'Product Name' },
              { key: 'price', label: 'Price' },
              { key: 'observationDate', label: 'Observation Date' },
              { key: 'status', label: 'Status' },
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
                  const empty = { competitorName: '', competitorBrand: '', productName: '', price: '', observationDate: '', status: '' };
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
                    <td key={column.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {column.key === 'price'
                        ? `$${item[column.key as keyof typeof item].toFixed(2)}`
                        : item[column.key as keyof typeof item]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              {startIndex + 1}-{Math.min(endIndex, competitorInfosData.length)} of {competitorInfosData.length}
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
    </div>
  );
}

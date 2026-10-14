import { useState } from 'react';
import { FileUp, History, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { useSetStock, useWarehouseStock } from '../../../hooks/Stock/useStock';
import { Button } from '../../../components/ui/Button';
import { Pagination } from '../../../components/ui/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';
import { TableEmptyRow } from '../../../components/ui/TableEmptyRow';
import { TableSkeletonRows } from '../../../components/ui/skeleton';
import { StockEditDrawer } from './StockEditDrawer';
import { StockEntryAdd } from './StockEntryAdd';
import { StockImportDrawer } from './StockImportDrawer';
import { StockMovementsDrawer } from './StockMovementsDrawer';
import type { StockBalance, StockLevel } from '../../../types/Stock';

const LEVEL_STYLES: Record<StockLevel, { label: string; style: string }> = {
  low: { label: 'Low', style: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  medium: { label: 'Medium', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  good: { label: 'Good', style: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
};

interface WarehouseStockTabProps {
  warehouseId: number;
  warehouseName: string;
}

/** The "Stock" tab of the warehouse view: what is on hand here, with Add stock and each item's history. */
export function WarehouseStockTab({ warehouseId, warehouseName }: WarehouseStockTabProps) {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [panel, setPanel] = useState<'add' | 'import' | null>(null);
  const [history, setHistory] = useState<StockBalance | null>(null);
  const [editing, setEditing] = useState<StockBalance | null>(null);
  const setStock = useSetStock();
  const query = search.trim();
  const debounced = useDebounce(query, 300);
  const { data, isLoading, isFetching } = useWarehouseStock({ warehouseId, search: debounced || undefined, page, perPage });
  const rows = data?.data ?? [];
  const meta = data?.meta;
  const remove = (row: StockBalance) => {
    if (window.confirm(`Remove all ${[row.itemCode, row.itemName].filter(Boolean).join(' - ')} stock from ${warehouseName}? This sets it to 0; the history keeps the record.`)) setStock.mutate({ warehouseId, itemId: row.itemId, quantity: 0 });
  };
  const iconButton = 'cursor-pointer rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="mt-3 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search items in this warehouse" debounceMs={0} className="w-72" />
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('stock-entry.create') && <Button variant="outline" leftIcon={<FileUp className="h-4 w-4" />} onClick={() => setPanel('import')}>Import CSV</Button>}
          {hasPermission('stock-entry.create') && <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setPanel('add')}>Add stock</Button>}
        </div>
      </div>

      <div className={`overflow-hidden rounded-lg border border-[var(--border-color)] transition-opacity ${isFetching && !isLoading ? 'opacity-70' : ''}`}>
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)] text-left text-xs uppercase tracking-wider text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3">UOM</th>
              <th className="px-4 py-3">Level</th>
              <th className="w-32 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {isLoading ? (
              <TableSkeletonRows rows={8} label="Loading stock" columns={['text', 'text', 'number', 'text', 'badge', 'check']} />
            ) : rows.length === 0 ? (
              <TableEmptyRow colSpan={6} label={debounced ? 'No matching items.' : 'No stock in this warehouse yet.'} hint={debounced ? undefined : 'Use Add stock to enter opening stock or a receipt.'} />
            ) : (
              rows.map((row) => (
                <tr key={row.itemId} className="hover:bg-[var(--bg-secondary)]">
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{row.itemCode ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{row.itemName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-[var(--text-primary)]">{Number(row.onHand)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{row.baseUomName ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[row.level].style}`}>{LEVEL_STYLES[row.level].label}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button type="button" title="History" aria-label="Stock history" onClick={() => setHistory(row)} className={`${iconButton} hover:text-[var(--text-primary)]`}><History className="h-4 w-4" /></button>
                      {hasPermission('stock-entry.edit') && <button type="button" title="Edit" aria-label="Edit stock" disabled={setStock.isPending} onClick={() => setEditing(row)} className={`${iconButton} hover:text-primary-600`}><Pencil className="h-4 w-4" /></button>}
                      {hasPermission('stock-entry.delete') && <button type="button" title="Delete" aria-label="Delete stock" disabled={setStock.isPending} onClick={() => remove(row)} className={`${iconButton} hover:text-red-600`}><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {meta && meta.total > 0 && <Pagination currentPage={page} totalPages={meta.last_page} total={meta.total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} perPageOptions={[15, 25, 50]} />}
      </div>

      <StockEntryAdd isOpen={panel === 'add'} onClose={() => setPanel(null)} warehouseId={warehouseId} warehouseName={warehouseName} />
      <StockImportDrawer isOpen={panel === 'import'} onClose={() => setPanel(null)} warehouseId={warehouseId} warehouseName={warehouseName} />
      <StockEditDrawer isOpen={editing !== null} onClose={() => setEditing(null)} warehouseId={warehouseId} row={editing} />
      <StockMovementsDrawer isOpen={history !== null} onClose={() => setHistory(null)} warehouseId={warehouseId} itemId={history?.itemId ?? null} itemLabel={history ? [history.itemCode, history.itemName].filter(Boolean).join(' - ') : ''} />
    </div>
  );
}

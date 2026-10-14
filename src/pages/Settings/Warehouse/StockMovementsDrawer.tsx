import { useState } from 'react';
import { Drawer } from '../../../components/ui/Drawer';
import { Pagination } from '../../../components/ui/Pagination';
import { TableEmptyRow } from '../../../components/ui/TableEmptyRow';
import { TableSkeletonRows } from '../../../components/ui/skeleton';
import { useStockMovements } from '../../../hooks/Stock/useStock';
import type { StockMovementType } from '../../../types/Stock';

interface StockMovementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: number;
  itemId: number | null;
  itemLabel: string;
}

const TYPE_LABELS: Record<StockMovementType, string> = { opening: 'Opening stock', receipt: 'Receipt', adjustment: 'Adjustment', transfer_in: 'Transfer in', transfer_out: 'Transfer out', load: 'Load', unload: 'Unload', sale: 'Sale', return: 'Return', reversal: 'Reversal' };

const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');

/** Every change to one item's stock in one warehouse, newest first, with the running balance. */
export function StockMovementsDrawer({ isOpen, onClose, warehouseId, itemId, itemLabel }: StockMovementsDrawerProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const { data, isLoading } = useStockMovements({ warehouseId, itemId: itemId ?? undefined, page, perPage }, isOpen && itemId !== null);
  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Stock history — ${itemLabel}`} width="w-[760px]">
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-[var(--border-color)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-secondary)] text-left text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Change</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <TableSkeletonRows rows={8} label="Loading stock history" columns={['date', 'badge', 'number', 'number', 'text']} />
              ) : rows.length === 0 ? (
                <TableEmptyRow colSpan={5} label="No stock movements yet." />
              ) : (
                rows.map((row) => (
                  <tr key={row.uuid}>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{formatDate(row.occurredAt)}</td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">{TYPE_LABELS[row.movementType] ?? row.movementType}</td>
                    <td className={`px-4 py-3 text-right font-medium tabular-nums ${Number(row.quantityChange) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{Number(row.quantityChange) > 0 ? '+' : ''}{Number(row.quantityChange)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--text-primary)]">{Number(row.balanceAfter)}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{row.sourceNumber ?? row.remark ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {meta && meta.total > 0 && <Pagination currentPage={page} totalPages={meta.last_page} total={meta.total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} perPageOptions={[15, 25, 50]} />}
        </div>
      </div>
    </Drawer>
  );
}

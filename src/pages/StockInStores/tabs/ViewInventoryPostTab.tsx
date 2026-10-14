import { useMemo } from 'react';
import type { StockInStoreRecord } from '../../../types/StockInStore';

interface ViewInventoryPostTabProps {
  selectedItem?: StockInStoreRecord | null;
}

export function ViewInventoryPostTab({ selectedItem }: ViewInventoryPostTabProps) {
  const posts = useMemo(() => {
    return selectedItem?.posts ?? [];
  }, [selectedItem]);

  const columns = [
    { label: 'Date', className: 'text-left min-w-[110px]' },
    { label: 'Item Code', className: 'text-left min-w-[120px]' },
    { label: 'Item', className: 'text-left min-w-[160px]' },
    { label: 'Customer Code', className: 'text-left min-w-[130px]' },
    { label: 'Customer', className: 'text-left min-w-[180px]' },
    { label: 'UOM', className: 'text-left min-w-[90px]' },
    { label: 'Capacity', className: 'text-left min-w-[100px]' },
    { label: 'Good Saleable Qty', className: 'text-right min-w-[130px]' },
    { label: 'Refill Qty', className: 'text-right min-w-[110px]' },
    { label: 'Reorder Qty', className: 'text-right min-w-[110px]' },
    { label: 'Fill', className: 'text-right min-w-[90px]' },
    { label: 'Out Of Stock', className: 'text-right min-w-[110px]' },
  ];

  return (
    <div className="mt-5 space-y-4 animate-in fade-in duration-200">
      {/* Table Section */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-[var(--border-color)] overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-[#111827] text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-3 text-xs font-semibold tracking-wider ${col.className}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-color)]">
            {posts.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-[var(--bg-secondary)]/60 transition-colors">
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.date}</td>
                <td className="px-4 py-3 text-sm font-mono text-[var(--text-primary)]">{row.itemCode}</td>
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">{row.item}</td>
                <td className="px-4 py-3 text-sm font-mono text-[var(--text-secondary)]">{row.customerCode}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.customer}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{row.uom}</td>
                <td className="px-4 py-3 text-sm font-mono text-[var(--text-primary)]">{row.capacity}</td>
                <td className="px-4 py-3 text-sm font-mono text-right text-[var(--text-primary)]">{row.goodSaleableQty}</td>
                <td className="px-4 py-3 text-sm font-mono text-right text-[var(--text-primary)]">{row.refillQty}</td>
                <td className="px-4 py-3 text-sm font-mono text-right text-[var(--text-primary)]">{row.reorderQty}</td>
                <td className="px-4 py-3 text-sm font-mono text-right text-[var(--text-primary)]">{row.fill}%</td>
                <td className="px-4 py-3 text-sm font-mono text-right text-red-500 font-semibold">{row.outOfStock}</td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[var(--text-muted)] text-sm">
                  No inventory posts recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

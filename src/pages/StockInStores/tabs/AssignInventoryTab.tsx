import { useMemo } from 'react';
import { Package } from 'lucide-react';
import type { StockInStoreRecord } from '../../../types/StockInStore';

interface AssignInventoryTabProps {
  selectedItem?: StockInStoreRecord | null;
}

export function AssignInventoryTab({ selectedItem }: AssignInventoryTabProps) {
  const items = useMemo(() => {
    return selectedItem?.items ?? [];
  }, [selectedItem]);

  return (
    <div className="mt-5 space-y-4 animate-in fade-in duration-200">
      <div className="rounded-xl overflow-hidden shadow-sm border border-[var(--border-color)]">
        <table className="w-full text-left">
          <thead className="bg-[#111827] text-white">
            <tr>
              {/* Item Code Header */}
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-1/4">
                Item Code
              </th>

              {/* Item Name Header */}
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-1/2">
                Item Name
              </th>

              {/* Item Uom Header */}
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-32">
                Item Uom
              </th>

              {/* Capacity Header */}
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-36 text-right">
                Capacity
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-color)]">
            {items.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-[var(--bg-secondary)]/60 transition-colors">
                <td className="px-4 py-3.5 text-sm font-mono text-[var(--text-primary)]">{row.itemCode}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-[var(--text-primary)]">{row.itemName}</td>
                <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{row.itemUom}</td>
                <td className="px-4 py-3.5 text-sm text-[var(--text-primary)] font-mono text-right">{row.capacity}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[var(--text-muted)] text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-7 h-7 opacity-40" />
                    <span>No items assigned yet.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

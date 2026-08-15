import { Search } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

const DUMMY_DATA: any[] = [];

export function DamagedTab() {
  const searchableCols = [
    'Date',
    'MERCHANDISER',
    'CUSTOMER CODE',
    'CUSTOMER NAME',
    'ITEM CODE',
    'ITEM NAME',
    'DAMAGE ITEM',
    'EXPIRED ITEM',
    'SALEABLE ITEM',
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
      
      {/* Filters section */}
      <div className="flex items-end gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
        <div className="w-[180px]">
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Date</label>
          <Input type="date" value="2025-03-31" readOnly className="h-9 text-sm" />
        </div>
        <div className="flex items-center gap-2 mb-0.5">
          <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
            Filter
          </button>
          <button className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors">
            All
          </button>
        </div>
      </div>

      {/* Table section */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-[var(--border-color)] overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-[#0f0f0f] text-white">
            <tr>
              {searchableCols.map(col => (
                <th key={col} className="px-4 py-3 text-xs font-bold tracking-wider relative min-w-[120px]">
                  <div className="flex items-center justify-between gap-1 cursor-pointer hover:text-gray-300 transition-colors">
                    <span>{col}</span>
                    <Search className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-color)]">
            {DUMMY_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.date}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.merchandiser}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.customerCode}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.customerName}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.itemCode}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.itemName}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.damageItem}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.expiredItem}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.saleableItem}</td>
              </tr>
            ))}
            {DUMMY_DATA.length === 0 && (
              <tr>
                <td colSpan={searchableCols.length} className="px-4 py-12 text-center text-[var(--text-muted)] text-sm">
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

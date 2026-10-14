import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { DatePicker } from '../../../components/ui/DatePicker';
import { format, parse, isValid } from 'date-fns';
import type { StockInStoreRecord } from '../../../types/StockInStore';

interface DamagedTabProps {
  selectedItem?: StockInStoreRecord | null;
}

function parseDateValue(value: string | undefined | null): Date | null {
  if (!value) return null;
  const raw = value.slice(0, 10);
  const parsed = parse(raw, 'yyyy-MM-dd', new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

export function DamagedTab({ selectedItem }: DamagedTabProps) {
  const [filterDate, setFilterDate] = useState('');
  const [appliedDate, setAppliedDate] = useState('');

  const searchableCols = [
    'DATE',
    'MERCHANDISER',
    'CUSTOMER CODE',
    'CUSTOMER NAME',
    'ITEM CODE',
    'ITEM NAME',
    'DAMAGE ITEM',
    'EXPIRED ITEM',
    'SALEABLE ITEM',
  ];

  const allDamages = useMemo(() => {
    return selectedItem?.damages ?? [];
  }, [selectedItem]);

  const filteredDamages = useMemo(() => {
    if (!appliedDate) return allDamages;
    return allDamages.filter((item) => item.date === appliedDate);
  }, [allDamages, appliedDate]);

  const handleApplyFilter = () => {
    setAppliedDate(filterDate);
  };

  const handleResetFilter = () => {
    setFilterDate('');
    setAppliedDate('');
  };

  return (
    <div className="mt-5 space-y-4 animate-in fade-in duration-200">
      {/* Filters section */}
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
        <div className="w-[190px]">
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date</label>
          <DatePicker
            selected={parseDateValue(filterDate)}
            onChange={(d) => setFilterDate(d ? format(d, 'yyyy-MM-dd') : '')}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
          />
        </div>

        <div className="flex items-center gap-2 mb-0.5">
          <button
            type="button"
            onClick={handleApplyFilter}
            className="h-[38px] px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleResetFilter}
            className="h-[38px] px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            All
          </button>
        </div>
      </div>

      {/* Table section */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-[var(--border-color)] overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-[#111827] text-white">
            <tr>
              {searchableCols.map((col) => (
                <th key={col} className="px-4 py-3 text-xs font-semibold tracking-wider relative min-w-[120px]">
                  <div className="flex items-center justify-between gap-1">
                    <span>{col}</span>
                    <Search className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-color)]">
            {filteredDamages.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-[var(--bg-secondary)]/60 transition-colors">
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.date}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.merchandiser}</td>
                <td className="px-4 py-3 text-sm font-mono text-[var(--text-secondary)]">{row.customerCode}</td>
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">{row.customerName}</td>
                <td className="px-4 py-3 text-sm font-mono text-[var(--text-primary)]">{row.itemCode}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.itemName}</td>
                <td className="px-4 py-3 text-sm font-mono text-right text-amber-600 font-semibold">{row.damageItem}</td>
                <td className="px-4 py-3 text-sm font-mono text-right text-red-500 font-semibold">{row.expiredItem}</td>
                <td className="px-4 py-3 text-sm font-mono text-right text-emerald-600 font-semibold">{row.saleableItem}</td>
              </tr>
            ))}
            {filteredDamages.length === 0 && (
              <tr>
                <td colSpan={searchableCols.length} className="px-4 py-12 text-center text-[var(--text-muted)] text-sm">
                  {appliedDate ? 'No records match the selected date.' : 'No damage records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

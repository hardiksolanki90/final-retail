import { Search } from 'lucide-react';

const DUMMY_DATA = [
  { itemCode: 'GU2003', itemName: 'Safa LL Lban Plain 180mL8X4', uom: 'CT', capacity: '20.00' },
  { itemCode: 'GU1001', itemName: 'Safa LL Milk FC 1L4X3', uom: 'CT', capacity: '1180.00' },
];

export function AssignInventoryTab() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
      <div className="rounded-xl overflow-hidden shadow-sm border border-[var(--border-color)]">
        <table className="w-full text-left">
          <thead className="bg-[#0f0f0f] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition-colors">
                  Item Code
                  <Search className="w-3 h-3 ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition-colors">
                  Item Name
                  <Search className="w-3 h-3 ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">
                Item Uom
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">
                Capacity
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-color)]">
            {DUMMY_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.itemCode}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.itemName}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.uom}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.capacity}</td>
              </tr>
            ))}
            {DUMMY_DATA.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                  No inventory assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

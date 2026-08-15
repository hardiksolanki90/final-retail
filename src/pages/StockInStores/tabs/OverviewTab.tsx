import { User } from 'lucide-react';

interface OverviewTabProps {
  selectedItem: { id: number; activityName: string; dateFrom: string } | null;
}

const CUSTOMERS = [
  { code: '120495', name: 'Armed Forces Co-operative Society' },
  { code: '177971', name: 'Safa Express Supermarket S P LLC' },
  { code: '510323', name: 'AL SUWEIDAA MODERN BAKERY' },
  { code: '607340', name: 'AL TAMAYOZ HYPERMARKET' },
  { code: '141511', name: 'Al Ain City Center LLC-Branch Al Yahar' },
  { code: '176518', name: 'Armed Forces Co-op.Society-Br:2' },
  { code: '614226', name: 'MOHAMMED AKTER SUPERMARKET LLC-BR.' },
  { code: '614484', name: 'MOHAMMED AKTER SUPERMARKET LLC BR..' },
  { code: '615649', name: 'JIMI GIFT MARKET' },
  { code: '513535', name: 'AL TAMAYOZ HYPERMARKET - BR.' },
  { code: '502053', name: 'GULF CO OPERATION SUPERMARKET' },
  { code: '501497', name: 'ABU HAMAD TRADING - L L C' },
  { code: '802699', name: 'QAMAR AL MADINA SUPERMARKET' },
];

export function OverviewTab({ selectedItem }: OverviewTabProps) {
  if (!selectedItem) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* Read-Only Details Grid */}
      <div className="grid grid-cols-2 gap-y-4 max-w-xl">
        <div className="text-sm text-[var(--text-secondary)]">Activity Name:</div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">{selectedItem.activityName}</div>

        <div className="text-sm text-[var(--text-secondary)]">Date From:</div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">{selectedItem.dateFrom}</div>

        <div className="text-sm text-[var(--text-secondary)]">Date To:</div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">2021-12-31</div>
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* Customers Block */}
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Customers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CUSTOMERS.map((customer) => (
            <div
              key={customer.code}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-[var(--border-color)] flex flex-col justify-center gap-1 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <User className="w-4 h-4" />
                <span>{customer.code}</span>
              </div>
              <div className="text-sm text-[var(--text-primary)] font-medium leading-tight h-10 mt-1">
                {customer.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

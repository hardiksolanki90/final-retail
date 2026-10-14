import { User, Calendar, Tag, Users } from 'lucide-react';
import type { StockInStoreRecord } from '../../../types/StockInStore';

interface OverviewTabProps {
  selectedItem: StockInStoreRecord | null;
}

export function OverviewTab({ selectedItem }: OverviewTabProps) {
  if (!selectedItem) return null;

  const customers = selectedItem.customers ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Read-Only Details Grid */}
      <div className="mt-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm w-full">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Activity Information</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <dt className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary-500" />
              Activity Name
            </dt>
            <dd className="text-sm font-semibold text-[var(--text-primary)]">{selectedItem.activityName || '—'}</dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary-500" />
              Date From
            </dt>
            <dd className="text-sm font-semibold text-[var(--text-primary)]">{selectedItem.dateFrom || '—'}</dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary-500" />
              Date To
            </dt>
            <dd className="text-sm font-semibold text-[var(--text-primary)]">{selectedItem.dateTo || '—'}</dd>
          </div>
        </dl>
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* Customers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Customers <span className="text-sm font-normal text-[var(--text-secondary)]">({customers.length})</span>
          </h3>
        </div>

        {customers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-color)] p-8 text-center text-sm text-[var(--text-muted)]">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No customers assigned to this inventory activity.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {customers.map((customer) => (
              <div
                key={customer.code || customer.name}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-[var(--border-color)] flex flex-col justify-between gap-2 hover:border-primary-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-[var(--text-secondary)]">
                  <User className="w-3.5 h-3.5 text-primary-600" />
                  <span>{customer.code || '—'}</span>
                </div>
                <div className="text-sm text-[var(--text-primary)] font-medium leading-snug line-clamp-2">
                  {customer.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

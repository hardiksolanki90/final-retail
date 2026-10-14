import { Pencil } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { FormSkeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../context/AuthContext';
import { useRouteItemGrouping } from '../../hooks/RouteItemGroupings/useRouteItemGroupings';
import type { RouteItemGrouping } from '../../types/RouteItemGrouping';

interface RouteItemGroupingViewProps {
  /** The group being shown; the row from the list is used until the full group (with items) arrives. */
  row: RouteItemGrouping | null;
  onClose: () => void;
  onEdit: (uuid: string) => void;
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</dt>
    <dd className="mt-1 text-sm text-[var(--text-primary)]">{value}</dd>
  </div>
);

/** Read-only look at one group: its header and its items. */
export function RouteItemGroupingView({ row, onClose, onEdit }: RouteItemGroupingViewProps) {
  const { hasPermission } = useAuth();
  const { data, isLoading } = useRouteItemGrouping(row?.uuid ?? null);
  const grouping = data ?? row;
  const edit = hasPermission('route-item-grouping.edit') && row ? <button type="button" onClick={() => onEdit(row.uuid)} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"><Pencil className="h-4 w-4" />Edit</button> : null;

  return (
    <Drawer isOpen={row !== null} onClose={onClose} title={grouping ? `${grouping.code} - ${grouping.name}` : 'Route Item Grouping'} width="w-[560px]" headerActions={edit} isLoading={isLoading && !data} skeleton={<FormSkeleton fields={[['input', 'input'], ['input', 'input'], 'section', 'input']} />}>
      {grouping && (
        <div className="space-y-6 p-6">
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Route" value={grouping.routeName ?? '—'} />
            <Field label="Salesman" value={grouping.salesmanName ? [grouping.salesmanCode, grouping.salesmanName].filter(Boolean).join(' - ') : '—'} />
            <Field label="Status" value={grouping.status ? 'Active' : 'Inactive'} />
            <Field label="Items" value={String(grouping.itemCount)} />
          </dl>
          <div className="overflow-hidden rounded-lg border border-[var(--border-color)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-secondary)] text-left text-xs uppercase tracking-wider text-[var(--text-muted)]">
                <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Item</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {(data?.items ?? []).map((item) => (
                  <tr key={item.itemId}><td className="whitespace-nowrap px-4 py-2 text-[var(--text-secondary)]">{item.itemCode ?? '—'}</td><td className="px-4 py-2 text-[var(--text-primary)]">{item.itemName ?? '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Drawer>
  );
}

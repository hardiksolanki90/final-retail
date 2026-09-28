import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface TableEmptyRowProps {
  colSpan: number;
  label: string;
  hint?: string;
  icon?: LucideIcon;
}

export function TableEmptyRow({ colSpan, label, hint, icon: Icon = Inbox }: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg border border-dashed border-[var(--border-color)] text-[var(--text-muted)]">
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {label}
            </p>
            {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
          </div>
        </div>
      </td>
    </tr>
  );
}

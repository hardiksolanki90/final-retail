import { Loader2 } from 'lucide-react';

interface TableLoadingRowProps {
  colSpan: number;
  label?: string;
}

export function TableLoadingRow({ colSpan, label = 'Loading…' }: TableLoadingRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{label}</span>
        </div>
      </td>
    </tr>
  );
}

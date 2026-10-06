import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';

/** What a table column holds — each list passes one entry per visible column, in the same order as its <th> cells. */
export type SkeletonColumn = 'check' | 'text' | 'text-sub' | 'badge' | 'number' | 'date' | 'avatar' | 'actions' | 'action';

// Rows-per-page can be 500; more skeleton rows than a screen shows adds nothing.
const MAX_ROWS = 25;
// Fixed (not random) so a skeleton never re-draws differently between renders.
const TEXT_WIDTHS = ['w-3/4', 'w-2/3', 'w-5/6', 'w-1/2'];

// One-line cells sit in a 20px line (like the real text-sm / badge cells) so rows without an actions column are as tall as real ones.
function Line({ children }: { children: ReactNode }) {
  return <div className="flex h-5 items-center">{children}</div>;
}

function Cell({ kind, seed }: { kind: SkeletonColumn; seed: number }) {
  const text = TEXT_WIDTHS[seed % TEXT_WIDTHS.length];
  switch (kind) {
    case 'check':
      return (
        <Line>
          <Skeleton className="h-4 w-4" />
        </Line>
      );
    case 'text':
      return (
        <Line>
          <Skeleton className={`h-4 ${text}`} />
        </Line>
      );
    case 'text-sub':
      return (
        <div className="space-y-1.5">
          <Skeleton className={`h-4 ${text}`} />
          <Skeleton className="h-3 w-1/3" />
        </div>
      );
    case 'badge':
      return (
        <Line>
          <Skeleton className="h-5 w-16 rounded-full" />
        </Line>
      );
    case 'number':
      return (
        <Line>
          <Skeleton className="ml-auto h-4 w-16" />
        </Line>
      );
    case 'date':
      return (
        <Line>
          <Skeleton className="h-4 w-24" />
        </Line>
      );
    case 'avatar':
      return (
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className={`h-4 ${text}`} />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      );
    case 'action':
      // A lone Delete button (document lists).
      return (
        <div className="flex justify-end">
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      );
    case 'actions':
      // Same height as the Edit / Delete buttons, so rows are as tall as the real ones.
      return (
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      );
  }
}

interface TableSkeletonRowsProps {
  columns: SkeletonColumn[];
  /** The list's current page size, so the table keeps its loaded height. */
  rows: number;
  /** Announced to screen readers, e.g. "Loading brands". */
  label: string;
  /** For lists whose cells use `py-3` instead of `py-4`. */
  dense?: boolean;
}

/** Placeholder <tr>s for a list's <tbody> — replaces TableLoadingRow. Header, toolbar and pagination stay real. */
export function TableSkeletonRows({ columns, rows, label, dense = false }: TableSkeletonRowsProps): ReactNode {
  return (
    <>
      {Array.from({ length: Math.min(Math.max(rows, 1), MAX_ROWS) }).map((_, r) => (
        <tr key={r} aria-hidden={r === 0 ? undefined : true}>
          {columns.map((kind, c) => (
            <td key={c} className={`px-4 ${dense ? 'py-3' : 'py-4'} whitespace-nowrap`}>
              {r === 0 && c === 0 && (
                <span className="sr-only" role="status" aria-busy="true">
                  {label}
                </span>
              )}
              <Cell kind={kind} seed={r + c} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

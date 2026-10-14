import type { ReactNode } from 'react';
import { Skeleton } from '../../../components/ui/skeleton';

export interface InfoRow {
  label: string;
  value?: ReactNode;
}

/** A titled block of label / value pairs (customer profile, document details); empty values read "—". */
export function InfoSection({ title, rows, children }: { title: string; rows?: InfoRow[]; children?: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[4px] border border-[var(--rv-border)]">
      <h3 className="flex h-10 items-center bg-[var(--rv-head)] px-[14px] font-semibold text-[var(--rv-text)]">{title}</h3>
      {rows && (
        <dl className="grid gap-x-8 gap-y-4 px-[14px] py-4 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-[13px] leading-5 text-[var(--rv-muted)]">{row.label}</dt>
              <dd className="mt-0.5 break-words leading-5 text-[var(--rv-ink)]">
                {row.value === undefined || row.value === null || row.value === '' ? <span className="text-[var(--rv-muted)]">—</span> : row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </section>
  );
}

/** Placeholder for a stack of InfoSections while the record loads. */
export function InfoSectionsSkeleton({ titles }: { titles: string[] }) {
  return (
    <div className="mt-3 space-y-4" aria-hidden>
      {titles.map((title) => (
        <section key={title} className="overflow-hidden rounded-[4px] border border-[var(--rv-border)]">
          <h3 className="flex h-10 items-center bg-[var(--rv-head)] px-[14px] font-semibold text-[var(--rv-text)]">{title}</h3>
          <div className="grid gap-x-8 gap-y-4 px-[14px] py-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Stands in for one value that is still loading, inside an InfoSection row. */
export function PendingValue() {
  return <Skeleton className="mt-0.5 h-4 w-28" />;
}

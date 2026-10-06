import { Skeleton, SkeletonRegion } from '../../../components/ui/skeleton';

const mono = 'font-[family-name:var(--font-mono-ui)] tracking-wide';
const SECTIONS = [4, 4, 3]; // checkboxes in the Location / Customer / Item key groups
const STEP_LABEL_WIDTHS = ['w-32', 'w-16', 'w-20'];

/**
 * Shown while an edited rule loads. Mirrors the wizard as it opens: page header, the 3-step rail,
 * the first step (saved-key select + Location / Customer / Item checkbox groups) and the footer.
 * The title is real text — it doesn't depend on the record.
 */
export function RuleFormSkeleton({ title }: { title: string }) {
  return (
    <SkeletonRegion label={`Loading ${title.toLowerCase()}`} className="min-h-screen bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <p className={`text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] ${mono}`}>Editing rule</p>
            <h1 className="font-display text-xl font-bold leading-tight tracking-tight text-[var(--text-primary)]">{title}</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
          {/* Step rail */}
          <div className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40 px-6 py-6 sm:px-10">
            <div className="flex items-start">
              {STEP_LABEL_WIDTHS.map((w, i) => (
                <div key={i} className="flex flex-1 items-start last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="hidden h-[15px] items-center sm:flex">
                      <Skeleton className={`h-2.5 ${w}`} />
                    </div>
                  </div>
                  {i < STEP_LABEL_WIDTHS.length - 1 && <div className="mx-3 mt-[18px] h-[2px] flex-1 rounded-full bg-[var(--border-color)] sm:mx-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Select Key Combination */}
          <div className="min-h-[380px] px-6 py-8 sm:px-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="mb-1 flex h-5 items-center">
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <Skeleton className="h-[42px] w-full rounded-lg" />
                <div className="flex h-[15px] items-center">
                  <Skeleton className="h-2.5 w-2/3" />
                </div>
              </div>
              {SECTIONS.map((count, s) => (
                <div key={s} className="space-y-4 border-b border-[var(--border-color)] pb-6 last:border-b-0 last:pb-0">
                  <div className="flex h-[17px] items-center">
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: count }).map((_, i) => (
                      <div key={i} className="flex h-5 items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-3.5 w-28" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Skeleton className="h-[29px] w-28 rounded-full" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/40 px-6 py-4 sm:px-10">
            <Skeleton className="h-2.5 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-[38px] w-20 rounded-lg" />
              <Skeleton className="h-[38px] w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}

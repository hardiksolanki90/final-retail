import { Skeleton } from '../../../components/ui/skeleton';

/** Stands in for a document form while the saved document loads: header sections, a few item rows, the summary card. */
export function DocumentEditSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <span className="sr-only">Loading document</span>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-56 w-full rounded-xl sm:w-[40rem]" />
      </div>
    </div>
  );
}

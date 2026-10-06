import { Loader2 } from 'lucide-react';

/** Centered spinner for a page whose data is still loading (edit pages, detail pages). */
export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

/** Shown instead of an edit form whose record couldn't be loaded — never a blank form that could overwrite it. */
export function PageLoadError({ label = 'Failed to load details.', onBack }: { label?: string; onBack: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="alert">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <button
        type="button"
        onClick={onBack}
        className="px-5 py-2 text-sm font-medium cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Back
      </button>
    </div>
  );
}

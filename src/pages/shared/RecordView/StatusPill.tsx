import type { SheetTone } from '../../../types/DocumentView';

const TONES: Record<SheetTone, string> = {
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  accent: 'bg-[var(--rv-accent-soft)] text-[var(--rv-accent)]',
  success: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

/** Small rounded status label, coloured by tone. */
export function StatusPill({ label, tone }: { label: string; tone: SheetTone }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-4 ${TONES[tone]}`}>{label}</span>;
}

import type { ReactNode } from 'react';

/** Flat section label — small uppercase caption with a colored rule, no boxes or icons. */
export function SectionLabel({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 pb-2 mb-1 border-b border-gray-200 dark:border-gray-800">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <span className="w-1 h-3.5 rounded-full bg-primary-600" />
        {title}
      </h3>
      {action}
    </div>
  );
}

export default SectionLabel;

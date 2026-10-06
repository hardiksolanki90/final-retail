import type { ReactNode } from 'react';

/** One pulsing placeholder bar — size and shape come from `className` (the screen decides what it stands in for). */
export function Skeleton({ className = '' }: { className?: string }) {
  // Rounded by default; a screen with its own corner style (e.g. square) passes its own `rounded-*`.
  const corners = className.includes('rounded') ? '' : 'rounded';
  return <div aria-hidden="true" className={`animate-pulse motion-reduce:animate-none bg-gray-200 dark:bg-gray-700 ${corners} ${className}`} />;
}

/** Wraps a whole skeleton: one polite status announcement instead of one per bar. */
export function SkeletonRegion({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

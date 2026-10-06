// xl column grid templates for document lines (literal strings so Tailwind's scanner emits them).
// xl column templates: # · Item · UOM · [Reason] · Qty · numerics… · Total · ✕
const PRICED = 'xl:grid-cols-[1.75rem_minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_repeat(5,minmax(0,1fr))_minmax(0,1.2fr)_2rem]';
const PRICED_REASON = 'xl:grid-cols-[1.75rem_minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_repeat(5,minmax(0,1fr))_minmax(0,1.2fr)_2rem]';
const REASON = 'xl:grid-cols-[1.75rem_minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_repeat(4,minmax(0,1fr))_minmax(0,1.2fr)_2rem]';
const PRICED_NO_EXCISE = 'xl:grid-cols-[1.75rem_minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_repeat(4,minmax(0,1fr))_minmax(0,1.2fr)_2rem]';

/** Column template for a line: optional Reason column; the Excise column only when an item has excise. */
export function lineCols({ reason, excise }: { reason: boolean; excise: boolean }): string {
  if (reason) return excise ? PRICED_REASON : REASON;
  return excise ? PRICED : PRICED_NO_EXCISE;
}

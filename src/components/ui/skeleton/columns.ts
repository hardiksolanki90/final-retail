import type { SkeletonColumn } from './TableSkeletonRows';

/** `when(isCodeVisible, 'text')` — the column(s) for a list column the user can hide. */
export const when = (visible: boolean, ...kinds: SkeletonColumn[]): SkeletonColumn[] => (visible ? kinds : []);

/** One kind per visible column of a list driven by a `columns` array; unlisted keys are plain text. */
export const colsByKey = (cols: { key: string }[], kinds: Record<string, SkeletonColumn> = {}): SkeletonColumn[] => cols.map((c) => kinds[c.key] ?? 'text');

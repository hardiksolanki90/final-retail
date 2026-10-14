import { useQuery } from '@tanstack/react-query';
import { RECORD_DETAIL_KEY } from '../lib/recordCache';
import { readPath } from '../utils/readPath';

interface UseRecordDetailOptions<D> {
  /** Cache name of the record kind, e.g. "brand". */
  entity: string;
  /** The record's own uuid; no uuid = nothing selected, no request. */
  uuid?: string | null;
  /** The list row on screen; its values are shown at once. */
  row: object | null;
  /** Fetches the full record; leave out when the list row is all there is. */
  fetcher?: (uuid: string) => Promise<D>;
  /** Dotted paths the view shows. The detail is requested only when none of an entry's alternatives is on the row (a path with alternatives is an array). */
  shown: (string | string[])[];
}

/** The record to show: the list row, topped up from the detail request only when the row lacks a shown field. Cached with the global defaults and cleared after any change. */
export function useRecordDetail<D extends object>({ entity, uuid, row, fetcher, shown }: UseRecordDetailOptions<D>) {
  const missing = Boolean(row && fetcher && shown.some((paths) => (Array.isArray(paths) ? paths : [paths]).every((path) => readPath(row, path) === undefined)));
  const query = useQuery({ queryKey: [RECORD_DETAIL_KEY, entity, uuid], queryFn: () => (fetcher as (id: string) => Promise<D>)(uuid as string), enabled: Boolean(uuid && missing) });
  return { record: row ? { ...row, ...query.data } : null, isFetching: query.isFetching };
}

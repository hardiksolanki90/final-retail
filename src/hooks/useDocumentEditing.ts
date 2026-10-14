import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { FieldValues, UseFormReset } from 'react-hook-form';
import { getItemsByUuids } from '../api/ItemApi';
import { showToast } from '../lib/toast';
import type { SelectOption } from '../components/ui/Select';

interface Options<TView, TForm extends FieldValues> {
  /** Singular label for messages: "order", "credit note"… */
  label: string;
  /** The document being edited; undefined on the Add page (then nothing is fetched). */
  uuid?: string;
  fetcher: (uuid: string) => Promise<TView>;
  /** Saved document → the form's field values. */
  toForm: (saved: TView) => TForm;
  reset: UseFormReset<TForm>;
  /** Registers the saved lines' items so each line shows its item and offers its UOMs; leave out when the form already has every item option. */
  remember?: (options: SelectOption[]) => void;
  /** False until the form's own dropdown options have loaded — native selects can't show a saved value whose option isn't there yet. */
  waitFor?: boolean;
  listPath: string;
}

/**
 * Turns an Add page into an Add/Edit page. With a `uuid` it loads the saved document (always fresh), sends the user
 * back with a message if it's no longer pending, loads the saved lines' items, then resets the form to the saved values.
 * `isLoading` stays true until the form holds them, so the page can show a skeleton instead of an empty form.
 */
export function useDocumentEditing<TView extends { uuid: string; editable?: boolean; items: { itemId?: string | null }[] }, TForm extends FieldValues>({
  label,
  uuid,
  fetcher,
  toForm,
  reset,
  remember,
  waitFor = true,
  listPath,
}: Options<TView, TForm>) {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['document-edit', label, uuid], queryFn: () => fetcher(uuid as string), enabled: Boolean(uuid), staleTime: 0, gcTime: 0, refetchOnWindowFocus: false });
  const [ready, setReady] = useState(false);
  const saved = query.data;
  // Latest callbacks for the effect below, which should only run when a different document arrives.
  const latest = useRef({ toForm, reset, remember, navigate });
  useEffect(() => {
    latest.current = { toForm, reset, remember, navigate };
  });

  useEffect(() => {
    if (!saved || !waitFor) return;
    let cancelled = false;
    const { toForm: toValues, reset: resetForm, remember: rememberItems, navigate: go } = latest.current;
    if (saved.editable === false) {
      showToast.error(`This ${label} is no longer pending, so it can't be edited.`);
      go(listPath, { replace: true });
      return;
    }
    const itemUuids = [...new Set(saved.items.map((line) => line.itemId).filter((id): id is string => Boolean(id)))];
    (rememberItems ? getItemsByUuids(itemUuids).then((options) => rememberItems(options)) : Promise.resolve())
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) return;
        resetForm(toValues(saved));
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [saved, waitFor, label, listPath]);

  return { isEdit: Boolean(uuid), isLoading: Boolean(uuid) && !ready, saved };
}

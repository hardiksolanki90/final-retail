import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { FieldValues, UseFormReset } from 'react-hook-form';
import { getItemsByUuids } from '../api/ItemApi';
import { getOrderDetails } from '../api/OrderApi';
import { showToast } from '../lib/toast';
import type { SelectOption } from '../components/ui/Select';
import type { OrderView } from '../types/Order';

interface Options<TForm extends FieldValues> {
  /** The order being converted (the Add page's `?fromOrder=` uuid); undefined = a plain Add page, nothing is fetched. */
  orderUuid?: string;
  /** The saved order → the form's field values. */
  toForm: (order: OrderView) => TForm;
  reset: UseFormReset<TForm>;
  /** Registers the lines' items so each line shows its item and offers its UOMs. */
  remember?: (options: SelectOption[]) => void;
  /** Where to send the user if the order can't be loaded or can't be converted. */
  fallbackPath: string;
  /** A reason (shown to the user) why this order can't be converted, or null when it can. */
  blockedReason?: (order: OrderView) => string | null;
}

/**
 * Starts a new document from a saved order: loads the order fresh (any stage, unlike editing), loads its lines' items, then resets the
 * form to the values built from it. `isLoading` stays true until the form holds them, so the page shows a skeleton instead of an empty form.
 */
export function useDocumentFromOrder<TForm extends FieldValues>({ orderUuid, toForm, reset, remember, fallbackPath, blockedReason }: Options<TForm>) {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['document-from-order', orderUuid], queryFn: () => getOrderDetails(orderUuid as string), enabled: Boolean(orderUuid), staleTime: 0, gcTime: 0, refetchOnWindowFocus: false, retry: false });
  const [ready, setReady] = useState(false);
  const order = query.data;
  // Latest callbacks for the effects below, which should only run when the order arrives.
  const latest = useRef({ toForm, reset, remember, navigate, blockedReason });
  useEffect(() => {
    latest.current = { toForm, reset, remember, navigate, blockedReason };
  });

  useEffect(() => {
    if (!order) return undefined;
    let cancelled = false;
    const { toForm: toValues, reset: resetForm, remember: rememberItems, navigate: go, blockedReason: blocked } = latest.current;
    const reason = blocked?.(order);
    if (reason) {
      showToast.error(reason);
      go(fallbackPath, { replace: true });
      return undefined;
    }
    const itemUuids = [...new Set(order.items.map((line) => line.itemId).filter(Boolean))];
    (rememberItems ? getItemsByUuids(itemUuids).then((options) => rememberItems(options)) : Promise.resolve())
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) return;
        resetForm(toValues(order));
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [order, fallbackPath]);

  useEffect(() => {
    if (!query.isError) return;
    showToast.error("Couldn't load that order, so it can't be converted.");
    latest.current.navigate(fallbackPath, { replace: true });
  }, [query.isError, fallbackPath]);

  return { order, isLoading: Boolean(orderUuid) && !ready };
}

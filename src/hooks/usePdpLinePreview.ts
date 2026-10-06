import { useEffect, useRef, useState } from 'react';
import { usePdpResolution } from './useOrderForm';
import type { PdpResolution } from '../types/PdpResolution';

interface PreviewRow {
  itemId?: string;
  uom?: string;
  quantity?: number;
  price?: number;
}

interface Options {
  customerId: string;
  fields: { id: string }[];
  watchedItems: PreviewRow[] | undefined;
  /** Writes a server-resolved price/discount back into the form row. */
  setLine: (index: number, key: 'price' | 'discount', value: number) => void;
}

/**
 * Advisory price/discount preview per line, keyed by the row's field id. As
 * customer/item/uom/qty change, asks the server which plan applies and
 * prefills the row. The server re-resolves on save and ignores client-sent
 * price/discount whenever a plan (or the item master price) applies.
 */
export function usePdpLinePreview({ customerId, fields, watchedItems, setLine }: Options) {
  const { mutateAsync: resolveLine } = usePdpResolution();
  const [resolutions, setResolutions] = useState<Record<string, PdpResolution | undefined>>({});
  const requestedKeys = useRef<Record<string, string>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Latest values for the debounced callback below (read only after it fires).
  const fieldsRef = useRef(fields);
  const resolutionsRef = useRef(resolutions);
  const setLineRef = useRef(setLine);
  useEffect(() => {
    fieldsRef.current = fields;
    resolutionsRef.current = resolutions;
    setLineRef.current = setLine;
  });

  useEffect(() => {
    fields.forEach((field, index) => {
      const row = watchedItems?.[index];
      if (!row) return;

      const priceFromServer = resolutions[field.id]?.price != null;
      // Manual price only matters (for the discount preview) when the server
      // doesn't set it — otherwise it'd retrigger on the server's own price.
      // Price/discount depend on the UOM, so wait until the line has one (the
      // default UOM is filled right after an item is picked) and re-ask when it changes.
      const key = customerId && row.itemId && row.uom ? [customerId, row.itemId, row.uom, row.quantity, priceFromServer ? '' : row.price].join('|') : '';

      if (requestedKeys.current[field.id] === key) return;
      requestedKeys.current[field.id] = key;
      clearTimeout(timers.current[field.id]);

      if (!key) {
        setResolutions((prev) => ({ ...prev, [field.id]: undefined }));
        return;
      }

      timers.current[field.id] = setTimeout(async () => {
        try {
          const result = await resolveLine({ customerId, itemId: row.itemId!, itemUomId: row.uom || undefined, quantity: Number(row.quantity) || 0, price: Number(row.price) || 0 });

          const currentIndex = fieldsRef.current.findIndex((f) => f.id === field.id);
          if (requestedKeys.current[field.id] !== key || currentIndex === -1) return;

          const hadPlanDiscount = resolutionsRef.current[field.id]?.discount != null;
          if (result.price != null) setLineRef.current(currentIndex, 'price', result.price);
          if (result.discount != null) setLineRef.current(currentIndex, 'discount', result.discount);
          else if (hadPlanDiscount) setLineRef.current(currentIndex, 'discount', 0);
          setResolutions((prev) => ({ ...prev, [field.id]: result }));
        } catch {
          // Preview only — the server resolves authoritatively on save.
        }
      }, 400);
    });
  }, [customerId, watchedItems, fields, resolutions, resolveLine]);

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  return resolutions;
}

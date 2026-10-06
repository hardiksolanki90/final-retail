import { useCallback, useState } from 'react';
import type { SelectOption } from '../components/ui/Select';

/**
 * The items a form's line dropdowns have loaded so far (each option carries its UOMs). A line's
 * UOM list is looked up here, so it survives the item dropdown being re-searched or scrolled.
 */
export function useKnownItems() {
  const [known, setKnown] = useState<SelectOption[]>([]);

  const remember = useCallback((options: SelectOption[]) => {
    setKnown((prev) => {
      const seen = new Set(prev.map((o) => String(o.value)));
      const fresh = options.filter((o) => !seen.has(String(o.value)));
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    });
  }, []);

  return { known, remember };
}

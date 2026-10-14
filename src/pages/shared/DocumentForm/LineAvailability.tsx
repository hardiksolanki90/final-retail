import { useDebounce } from '../../../hooks/useDebounce';
import { useLineAvailability } from '../../../hooks/Stock/useStock';

interface LineAvailabilityProps {
  /** uuid of the warehouse the document takes stock from; nothing shows until one is chosen. */
  warehouse?: string;
  item?: string;
  uom?: string;
  quantity?: number;
}

/** Under a document line: what the warehouse holds of the item, and a warning when the line asks for more. */
export function LineAvailability({ warehouse, item, uom, quantity }: LineAvailabilityProps) {
  const asked = useDebounce(Number(quantity) || 0, 300);
  const { data } = useLineAvailability({ warehouse, item, uom, quantity: asked });
  if (!warehouse || !item || !data) return null;

  const onHand = `${Number(data.onHand)} ${data.baseUomName ?? ''}`.trim();

  return (
    <p className={`px-4 pb-3 text-xs xl:pl-[4.25rem] xl:pt-0 ${data.enough ? 'text-[var(--text-secondary)]' : 'font-medium text-red-600 dark:text-red-400'}`} role={data.enough ? undefined : 'alert'}>
      {data.enough ? `In stock: ${onHand}` : `Only ${onHand} in this warehouse; this line needs ${Number(data.required)}.`}
    </p>
  );
}

import type { OrderViewLine } from '../types/Order';

/** A saved line as the document forms hold it: `uuid` marks it as saved (the server keeps its price), `uom` is the UOM's uuid. */
export const toFormLine = (line: OrderViewLine) => ({
  id: '',
  uuid: line.uuid,
  itemId: line.itemId,
  uom: line.itemUomId ?? '',
  reason: line.reasonId ?? line.reason ?? '',
  quantity: line.quantity,
  price: line.price,
  discount: line.discount,
  vat: line.vat,
  net: line.net,
  excise: line.excise,
  total: line.total,
  isFree: line.isFree,
  orderLineUuid: line.orderLineUuid ?? undefined,
  orderedQty: line.orderedQty ?? undefined,
  maxQty: line.maxQty ?? undefined,
});

/** Dropdown lists load one page of options, so a saved record can be missing from them; this keeps it selectable (and labelled) while editing. */
export const ensureOption = <T extends { value: string | number; label: string }>(options: T[], value?: string | null, label?: string | null): T[] =>
  value && !options.some((o) => String(o.value) === value) ? ([{ value, label: label || value }, ...options] as T[]) : options;

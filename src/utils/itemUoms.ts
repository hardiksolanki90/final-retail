import type { SelectOption } from '../components/ui/Select';

/** The UOMs one item can be sold in (from its item-master prices); empty until the item is known. */
export function uomsForItem(items: SelectOption[], itemId: string | undefined): SelectOption[] {
  if (!itemId) return [];
  const uoms = items.find((item) => String(item.value) === itemId)?.uoms ?? [];
  return uoms.map(({ value, label }) => ({ value, label }));
}

/** The item's base UOM (falls back to its first), or undefined when it has none. */
export function baseUomFor(items: SelectOption[], itemId: string | undefined): string | undefined {
  const uoms = items.find((item) => String(item.value) === itemId)?.uoms ?? [];
  return uoms.find((uom) => uom.isBase)?.value ?? uoms[0]?.value;
}

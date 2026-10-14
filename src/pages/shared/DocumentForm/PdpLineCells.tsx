import type { ComponentProps } from 'react';
import { LineCell, LineNumberInput } from './index';

type InputProps = Omit<ComponentProps<typeof LineNumberInput>, 'locked' | 'title'>;

/** Price cell: always read-only (the server sets it from a pricing plan or the item master). */
export function PdpPriceCell(input: InputProps) {
  return (
    <LineCell label="Price">
      <LineNumberInput step="0.01" locked title="Prices come from pricing plans and the item master" {...input} />
    </LineCell>
  );
}

/** Discount cell: always read-only (the server applies the plan discount). */
export function PdpDiscountCell(input: InputProps) {
  return (
    <LineCell label="Discount">
      <LineNumberInput step="0.01" locked title="Discounts come from discount plans" {...input} />
    </LineCell>
  );
}

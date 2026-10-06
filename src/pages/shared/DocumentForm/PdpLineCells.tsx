import { Lock } from 'lucide-react';
import type { ComponentProps } from 'react';
import type { PdpResolution } from '../../../types/PdpResolution';
import { LineCell, LineNumberInput } from './index';

type InputProps = Omit<ComponentProps<typeof LineNumberInput>, 'locked' | 'title'>;

const badgeCls = 'mt-1 flex items-center justify-end gap-1 text-[10px] text-primary-600 dark:text-primary-400 truncate';

/** Price cell: always read-only (the server sets it from a pricing plan or the item master); badge shows the source. */
export function PdpPriceCell({ resolution, ...input }: InputProps & { resolution?: PdpResolution }) {
  const fromServer = resolution?.price != null;
  const master = resolution?.priceSource === 'master';
  const label = master ? 'Item price' : resolution?.pricingPlanName;

  return (
    <LineCell label="Price">
      <LineNumberInput step="0.01" locked title={fromServer ? (master ? 'Item master price' : 'Set by pricing plan') : 'Prices come from pricing plans and the item master'} {...input} />
      {fromServer && (
        <span className={badgeCls} title={label ?? ''}>
          <Lock className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
      )}
    </LineCell>
  );
}

/** Discount cell: always read-only (the server applies the plan discount); shows the plan name when one sets it. */
export function PdpDiscountCell({ resolution, ...input }: InputProps & { resolution?: PdpResolution }) {
  const fromPlan = resolution?.discount != null;

  return (
    <LineCell label="Discount">
      <LineNumberInput step="0.01" locked title={fromPlan ? 'Set by discount plan' : 'Discounts come from discount plans'} {...input} />
      {fromPlan && (
        <span className={badgeCls} title={resolution?.discountPlanName ?? ''}>
          <Lock className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{resolution?.discountPlanName}</span>
        </span>
      )}
    </LineCell>
  );
}

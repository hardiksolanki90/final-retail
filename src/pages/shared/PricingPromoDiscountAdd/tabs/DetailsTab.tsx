import { format, parse } from 'date-fns';
import type { RuleFormData, RuleType } from '../../../../types/PricingPromoDiscount';
import { Select, type SelectOption } from '../../../../components/ui/Select';
import { Input } from '../../../../components/ui/Input';
import { DatePicker } from '../../../../components/ui/DatePicker';

const mono = 'font-[family-name:var(--font-mono-ui)] tracking-wide';
const DATE_FORMAT = 'yyyy-MM-dd';

function toDate(value: string): Date | null {
  return value ? parse(value, DATE_FORMAT, new Date()) : null;
}
const sectionLabelCls = `text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] ${mono}`;

const OFFER_TYPE_OPTIONS: SelectOption[] = [
  { value: 'free_goods', label: 'Free Goods' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
];

const DISCOUNT_MAIN_TYPE_OPTIONS: SelectOption[] = [
  { value: 'slab', label: 'Slab' },
  { value: 'normal', label: 'Normal' },
];

const APPLY_ON_OPTIONS: SelectOption[] = [
  { value: 'quantity', label: 'Quantity' },
  { value: 'value', label: 'Value' },
];

const ORDER_ITEM_TYPE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All buy items' },
  { value: 'any', label: 'Any buy item' },
];

const REPEAT_OPTIONS: SelectOption[] = [
  { value: 'yes', label: 'Every multiple' },
  { value: 'no', label: 'Once' },
];

const DISCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'percentage', label: 'Percentage' },
];

interface Props {
  moduleType: RuleType;
  data: RuleFormData;
  onChange: (data: RuleFormData) => void;
}

export function DetailsTab({ moduleType, data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 pb-6 border-b border-[var(--border-color)]">
        <p className={sectionLabelCls}>Rule Details</p>
        <Input label="Name" value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} />

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            selected={toDate(data.startDate)}
            onChange={(date) => onChange({ ...data, startDate: date ? format(date, DATE_FORMAT) : '' })}
            placeholderText="Select start date"
          />
          <DatePicker
            label="End Date"
            selected={toDate(data.endDate)}
            onChange={(date) => onChange({ ...data, endDate: date ? format(date, DATE_FORMAT) : '' })}
            placeholderText="Select end date"
            minDate={toDate(data.startDate) ?? undefined}
          />
        </div>
      </div>

      {moduleType === 'promotion' && (
        <div className="space-y-4">
          <p className={sectionLabelCls}>Offer</p>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Order Type"
              placeholder="Select order type"
              value={data.offerType}
              onChange={(e) => onChange({ ...data, offerType: e.target.value as RuleFormData['offerType'] })}
              options={OFFER_TYPE_OPTIONS}
            />
            <Input
              type="number"
              label="Offer Value"
              className={mono}
              disabled={data.offerType === 'free_goods'}
              value={data.offerValue}
              onChange={(e) => onChange({ ...data, offerValue: e.target.value })}
            />
            <Select
              label="Buy Condition"
              value={data.orderItemType}
              onChange={(e) => onChange({ ...data, orderItemType: e.target.value as RuleFormData['orderItemType'] })}
              options={ORDER_ITEM_TYPE_OPTIONS}
            />
            <Select label="Repeat Offer" value={data.isRepeat ? 'yes' : 'no'} onChange={(e) => onChange({ ...data, isRepeat: e.target.value === 'yes' })} options={REPEAT_OPTIONS} />
          </div>
        </div>
      )}

      {moduleType === 'discount' && (
        <div className="space-y-4">
          <p className={sectionLabelCls}>Discount</p>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={data.discountMainType}
              onChange={(e) => onChange({ ...data, discountMainType: e.target.value as RuleFormData['discountMainType'] })}
              options={DISCOUNT_MAIN_TYPE_OPTIONS}
            />
            <Select
              label="Discount Type"
              placeholder="Select discount type"
              value={data.discountType}
              onChange={(e) => onChange({ ...data, discountType: e.target.value as RuleFormData['discountType'] })}
              options={DISCOUNT_TYPE_OPTIONS}
            />
          </div>
          {data.discountMainType === 'slab' && (
            <Select
              label="Slab Based On"
              value={data.discountApplyOn}
              onChange={(e) => onChange({ ...data, discountApplyOn: e.target.value as RuleFormData['discountApplyOn'] })}
              options={APPLY_ON_OPTIONS}
            />
          )}
          {data.discountMainType === 'normal' && (
            <Input
              type="number"
              label={data.discountType === 'percentage' ? 'Percentage' : 'Value'}
              className={mono}
              value={data.discountValue}
              onChange={(e) => onChange({ ...data, discountValue: e.target.value })}
            />
          )}
        </div>
      )}
    </div>
  );
}

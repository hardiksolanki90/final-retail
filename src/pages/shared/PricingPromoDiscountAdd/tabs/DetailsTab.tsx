import type { RuleFormData, RuleType } from '../../../../types/PricingPromoDiscount';
import { Select, type SelectOption } from '../../../../components/ui/Select';
import { Input } from '../../../../components/ui/Input';

const OFFER_TYPE_OPTIONS: SelectOption[] = [
  { value: 'free_goods', label: 'Free Goods' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
];

interface Props {
  moduleType: RuleType;
  data: RuleFormData;
  onChange: (data: RuleFormData) => void;
  customers: SelectOption[];
  itemGroups: SelectOption[];
}

export function DetailsTab({ moduleType, data, onChange, customers, itemGroups }: Props) {
  return (
    <div className="max-w-2xl space-y-5">
      <Input
        label="Name"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Customer"
          placeholder="— All customers —"
          searchable
          value={data.customerId}
          onChange={(e) => onChange({ ...data, customerId: String(e.target.value) })}
          options={customers}
        />
        <Select
          label="Item Group"
          placeholder="— All item groups —"
          searchable
          value={data.itemGroupId}
          onChange={(e) => onChange({ ...data, itemGroupId: String(e.target.value) })}
          options={itemGroups}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          label="Start Date"
          value={data.startDate}
          onChange={(e) => onChange({ ...data, startDate: e.target.value })}
        />
        <Input
          type="date"
          label="End Date"
          value={data.endDate}
          onChange={(e) => onChange({ ...data, endDate: e.target.value })}
        />
      </div>

      {moduleType === 'pricing' ? (
        <Input
          type="number"
          label="Price"
          value={data.price}
          onChange={(e) => onChange({ ...data, price: e.target.value })}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Offer Type"
            placeholder="Select offer type"
            value={data.offerType}
            onChange={(e) => onChange({ ...data, offerType: e.target.value as RuleFormData['offerType'] })}
            options={OFFER_TYPE_OPTIONS}
          />
          <Input
            type="number"
            label="Offer Value"
            disabled={data.offerType === 'free_goods'}
            value={data.offerValue}
            onChange={(e) => onChange({ ...data, offerValue: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

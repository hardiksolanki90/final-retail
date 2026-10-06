import type { ReactNode } from 'react';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Select, type SelectOption } from '../../../../components/ui/Select';
import type { RuleFormData } from '../../../../types/PricingPromoDiscount';

export interface SelectedKeys {
  country: boolean;
  region: boolean;
  area: boolean;
  route: boolean;
  salesOrganisation: boolean;
  channel: boolean;
  customerCategory: boolean;
  customer: boolean;
  itemCategory: boolean;
  itemGroup: boolean;
  item: boolean;
}

export const EMPTY_SELECTED_KEYS: SelectedKeys = {
  country: false,
  region: false,
  area: false,
  route: false,
  salesOrganisation: false,
  channel: false,
  customerCategory: false,
  customer: false,
  itemCategory: false,
  itemGroup: false,
  item: false,
};

// Single source of truth for display order (Location -> Customer -> Item)
// and for which RuleFormData field each key drives — every place that lists,
// summarizes, or clears a key reads from this array instead of keeping its
// own parallel list, so order and field names can never drift apart.
export const DIMENSION_ORDER: { key: keyof SelectedKeys; label: string; group: 'Location' | 'Customer' | 'Item'; field: keyof RuleFormData }[] = [
  { key: 'country', label: 'Country', group: 'Location', field: 'countryIds' },
  { key: 'region', label: 'Region', group: 'Location', field: 'regionIds' },
  { key: 'area', label: 'Area', group: 'Location', field: 'areaIds' },
  { key: 'route', label: 'Route', group: 'Location', field: 'routeIds' },
  { key: 'salesOrganisation', label: 'Sales Organisation', group: 'Customer', field: 'salesOrganisationIds' },
  { key: 'channel', label: 'Channel', group: 'Customer', field: 'channelIds' },
  { key: 'customerCategory', label: 'Customer Category', group: 'Customer', field: 'customerCategoryIds' },
  { key: 'customer', label: 'Customer', group: 'Customer', field: 'customerIds' },
  { key: 'itemCategory', label: 'Major Category', group: 'Item', field: 'itemCategoryIds' },
  { key: 'itemGroup', label: 'Item Group', group: 'Item', field: 'itemGroupIds' },
  { key: 'item', label: 'Item', group: 'Item', field: 'itemIds' },
];

export function keySummary(selectedKeys: SelectedKeys): string {
  return (
    DIMENSION_ORDER.filter((d) => selectedKeys[d.key])
      .map((d) => d.label)
      .join(', ') || '—'
  );
}

/** Converts a saved combination's flat `keys` array back into the checkbox shape. */
function keysArrayToSelectedKeys(keys: string[]): SelectedKeys {
  const next = { ...EMPTY_SELECTED_KEYS };
  for (const key of keys) {
    if (key in next) next[key as keyof SelectedKeys] = true;
  }
  return next;
}

export interface SavedKeyCombination {
  uuid: string;
  name: string | null;
  keys: string[];
}

interface Props {
  selectedKeys: SelectedKeys;
  onChange: (keys: SelectedKeys) => void;
  savedCombinations?: SavedKeyCombination[];
  onSaveCombination?: (data: { name?: string; keys: (keyof SelectedKeys)[] }) => void;
}

const mono = 'font-[family-name:var(--font-mono-ui)] tracking-wide';
const sectionLabelCls = `text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] ${mono}`;

function KeySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 pb-6 border-b border-[var(--border-color)] last:border-b-0 last:pb-0">
      <p className={sectionLabelCls}>{title}</p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

export function SelectKeyCombinationTab({ selectedKeys, onChange, savedCombinations = [], onSaveCombination }: Props) {
  function toggle(key: keyof SelectedKeys) {
    onChange({ ...selectedKeys, [key]: !selectedKeys[key] });
  }

  function dimensionsIn(group: 'Location' | 'Customer' | 'Item') {
    return DIMENSION_ORDER.filter((d) => d.group === group);
  }

  const keyOptions: SelectOption[] = savedCombinations.map((c) => ({ value: c.uuid, label: c.name || keySummary(keysArrayToSelectedKeys(c.keys)) }));

  // Highlights a saved combination in the dropdown only when the current
  // checkboxes exactly match it — an ad-hoc, not-yet-saved selection shows
  // no match, which is correct (nothing to highlight).
  const activeSelectedKeys = DIMENSION_ORDER.filter((d) => selectedKeys[d.key])
    .map((d) => d.key)
    .sort()
    .join(',');
  const matchingCombination = savedCombinations.find((c) => [...c.keys].sort().join(',') === activeSelectedKeys);

  function handlePickCombination(uuid: string) {
    const combination = savedCombinations.find((c) => c.uuid === uuid);
    if (combination) onChange(keysArrayToSelectedKeys(combination.keys));
  }

  function handleSaveCurrentSelection() {
    const keys = DIMENSION_ORDER.filter((d) => selectedKeys[d.key]).map((d) => d.key);
    if (keys.length === 0 || !onSaveCombination) return;
    const name = window.prompt('Name this key combination (optional):', keySummary(selectedKeys));
    if (name === null) return; // cancelled
    onSaveCombination({ name: name.trim() || undefined, keys });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Select
          label="Select Key"
          value={matchingCombination?.uuid ?? ''}
          onChange={(e) => handlePickCombination(e.target.value)}
          options={keyOptions}
          placeholder="— Select a saved key combination —"
          createAction={onSaveCombination ? { label: 'Save current selection as new key', onClick: handleSaveCurrentSelection } : undefined}
        />
        <p className={`text-[10px] ${mono} text-[var(--text-muted)]`}>To create a new key combination, check boxes below then click "+".</p>
      </div>

      {(['Location', 'Customer', 'Item'] as const).map((group) => (
        <KeySection key={group} title={group}>
          {dimensionsIn(group).map(({ key, label }) => (
            <Checkbox key={key} label={label} checked={selectedKeys[key]} onChange={() => toggle(key)} />
          ))}
        </KeySection>
      ))}

      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] ${mono}`}>
        KEY <span className="text-primary-600 dark:text-primary-400 font-semibold">{keySummary(selectedKeys)}</span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, Tag } from 'lucide-react';
import type { RuleType, RuleFormData, PricingPromotionRule } from '../../../types/PricingPromoDiscount';
import { SelectKeyCombinationTab, EMPTY_SELECTED_KEYS, DIMENSION_ORDER, keySummary, type SelectedKeys } from './tabs/SelectKeyCombinationTab';
import { KeyValueTab } from './tabs/KeyValueTab';
import { DetailsTab } from './tabs/DetailsTab';
import { ItemsTab } from './tabs/ItemsTab';
import { SlabsTab } from './tabs/SlabsTab';
import { useRuleDetail, useRuleFormOptions, useRuleMutations, useKeyCombinations } from '../../../hooks/usePricingPromotionRules';
import { PageLoadError } from '../../../components/ui/PageLoader';
import { RuleFormSkeleton } from './RuleFormSkeleton';
import { isDetailLoading } from '../../../hooks/useEntityDetail';

// Reserved "ledger" type pairing — same one used on the Auth screens and the
// Add Role form — applied here to give the rule-builder the same flagship
// treatment as this app's other high-stakes forms.
const mono = 'font-[family-name:var(--font-mono-ui)] tracking-wide';

// ── Tab definitions ───────────────────────────────────────────────────────────
type TabKey = 'keyCombination' | 'keyValue' | 'details';

const LABELS: Record<RuleType, string> = { pricing: 'Pricing', promotion: 'Promotion', discount: 'Discount' };

const DEFAULT_FORM: RuleFormData = {
  name: '',
  customerIds: [],
  itemGroupIds: [],
  countryIds: [],
  regionIds: [],
  areaIds: [],
  routeIds: [],
  salesOrganisationIds: [],
  channelIds: [],
  customerCategoryIds: [],
  itemCategoryIds: [],
  itemIds: [],
  startDate: '',
  endDate: '',
  offerType: '',
  offerValue: '',
  discountMainType: 'slab',
  discountApplyOn: 'quantity',
  orderItemType: 'all',
  isRepeat: true,
  discountType: '',
  discountValue: '',
  status: true,
  items: [],
  slabs: [],
};

// DIMENSION_ORDER's `field` is the form key (e.g. "countryIds"); the API
// exposes the same dimension as a plural relation (e.g. "countries") — this
// maps one to the other for the edit-mode load below.
export const DIMENSION_RELATION: Record<keyof SelectedKeys, keyof PricingPromotionRule> = {
  country: 'countries',
  region: 'regions',
  area: 'areas',
  route: 'routes',
  salesOrganisation: 'salesOrganisations',
  channel: 'channels',
  customerCategory: 'customerCategories',
  customer: 'customers',
  itemCategory: 'itemCategories',
  itemGroup: 'itemGroups',
  item: 'itemValues',
};

/** Maps a loaded rule (API shape) onto the wizard's form state and ticked key combination. */
function ruleToForm(rule: PricingPromotionRule): { formData: RuleFormData; selectedKeys: SelectedKeys } {
  const dimensionFields = {
    customerIds: [] as string[],
    itemGroupIds: [] as string[],
    countryIds: [] as string[],
    regionIds: [] as string[],
    areaIds: [] as string[],
    routeIds: [] as string[],
    salesOrganisationIds: [] as string[],
    channelIds: [] as string[],
    customerCategoryIds: [] as string[],
    itemCategoryIds: [] as string[],
    itemIds: [] as string[],
  };
  for (const { key, field } of DIMENSION_ORDER) {
    (dimensionFields as any)[field] = (rule[DIMENSION_RELATION[key]] as { id: string }[] | undefined)?.map((d) => d.id) ?? [];
  }

  const formData: RuleFormData = {
    ...dimensionFields,
    name: rule.name,
    startDate: rule.startDate,
    endDate: rule.endDate,
    offerType: rule.offerType ?? '',
    offerValue: rule.offerValue != null ? String(rule.offerValue) : '',
    discountMainType: rule.discountMainType ?? 'slab',
    discountApplyOn: rule.discountApplyOn ?? 'quantity',
    orderItemType: rule.orderItemType ?? 'all',
    isRepeat: rule.isRepeat ?? true,
    discountType: rule.discountType ?? '',
    discountValue: rule.discountValue != null ? String(rule.discountValue) : '',
    status: rule.status,
    items: rule.items ?? [],
    slabs: (rule.slabs ?? []).map((s) => ({
      id: String(s.id),
      minSlab: String(s.minSlab),
      maxSlab: String(s.maxSlab),
      value: s.value != null ? String(s.value) : '',
      percentage: s.percentage != null ? String(s.percentage) : '',
    })),
  };
  const nextKeys = { ...EMPTY_SELECTED_KEYS };
  for (const { key, field } of DIMENSION_ORDER) {
    nextKeys[key] = ((dimensionFields as any)[field] as string[]).length > 0;
  }
  return { formData, selectedKeys: nextKeys };
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  moduleType: RuleType;
  listPath: string; // e.g. "/promotion"
}

interface FormProps extends Props {
  /** The rule being edited (already loaded); omit to create a new one. */
  initialRule?: PricingPromotionRule;
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Add / Edit page. Editing loads the rule through the query cache (shared with the list's View
 * drawer) and shows a loader first, then mounts the form already filled in — so the form's own
 * state is initialised from the data, never overwritten by an effect while the user types.
 */
export function PricingPromoDiscountAdd({ moduleType, listPath }: Props) {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const ruleQuery = useRuleDetail(moduleType, uuid);
  const rule = ruleQuery.data;

  if (isDetailLoading(ruleQuery, uuid)) return <RuleFormSkeleton title={LABELS[moduleType]} />;
  if (uuid && !rule && ruleQuery.isError) return <PageLoadError label="Failed to load this record." onBack={() => navigate(listPath)} />;

  return <PricingPromoDiscountForm key={uuid ?? 'new'} moduleType={moduleType} listPath={listPath} initialRule={rule} />;
}

function PricingPromoDiscountForm({ moduleType, listPath, initialRule }: FormProps) {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEditing = Boolean(uuid);
  const hasItemsTab = moduleType !== 'discount';

  const [activeTab, setActiveTab] = useState<TabKey>('keyCombination');
  const [initial] = useState(() => (initialRule ? ruleToForm(initialRule) : null));
  const [formData, setFormData] = useState<RuleFormData>(initial?.formData ?? DEFAULT_FORM);
  const [selectedKeys, setSelectedKeys] = useState<SelectedKeys>(initial?.selectedKeys ?? EMPTY_SELECTED_KEYS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { customers, itemGroups, items, itemUoms } = useRuleFormOptions();
  const { createMutation, updateMutation } = useRuleMutations(moduleType);
  const { combinations, saveCombination } = useKeyCombinations();

  // Unchecking a key in "Select Key Combination" clears its value too, so an
  // unchecked key can't silently submit stale ids for it.
  function handleKeysChange(keys: SelectedKeys) {
    setSelectedKeys(keys);
    setFormData((prev) => {
      const next = { ...prev };
      for (const { key, field } of DIMENSION_ORDER) {
        if (!keys[key]) (next as any)[field] = [];
      }
      return next;
    });
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'keyCombination', label: 'Select Key Combination' },
    { key: 'keyValue', label: 'Key Value' },
    { key: 'details', label: LABELS[moduleType] },
  ];
  const tabIndex = TABS.findIndex((t) => t.key === activeTab);
  const isLastTab = tabIndex === TABS.length - 1;

  // Each step must have its own key selected/filled before moving on —
  // otherwise Key Value (or the Promotion/Pricing/Discount tab) opens with
  // nothing to act on. Any one of the 10 keys unblocks it — not just
  // Customer/Item Group.
  const anyKeySelected = DIMENSION_ORDER.some(({ key }) => selectedKeys[key]);
  const everySelectedKeyHasValue = DIMENSION_ORDER.every(({ key, field }) => !selectedKeys[key] || (formData[field] as unknown as string[]).length > 0);
  const nextBlockedReason =
    activeTab === 'keyCombination' && !anyKeySelected ? 'Select at least one key first.' : activeTab === 'keyValue' && !everySelectedKeyHasValue ? 'Select a value for every key you chose.' : null;

  function goNext() {
    if (!isLastTab && !nextBlockedReason) setActiveTab(TABS[tabIndex + 1].key);
  }

  function goBack() {
    if (tabIndex > 0) {
      setActiveTab(TABS[tabIndex - 1].key);
    } else {
      navigate(listPath);
    }
  }

  async function handleSave() {
    setIsSubmitting(true);
    try {
      if (isEditing && uuid) {
        await updateMutation.mutateAsync({ uuid, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate(listPath);
    } catch {
      // toast already shown by the mutation's onError handler
    } finally {
      setIsSubmitting(false);
    }
  }

  const keySummaryText = keySummary(selectedKeys);
  const hasAnyKey = anyKeySelected;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
            <Tag className="w-4.5 h-4.5" strokeWidth={2} />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] ${mono}`}>{isEditing ? 'Editing rule' : 'New rule'}</p>
            <h1 className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">{LABELS[moduleType]}</h1>
          </div>
        </div>

        {/* Live key summary — travels with the rule once it has a key */}
        {hasAnyKey && (
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] ${mono}`}
          >
            KEY <span className="text-primary-600 dark:text-primary-400">{keySummaryText}</span>
          </span>
        )}
      </div>

      {/* Card */}
      <div className="px-6 py-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm">
          {/* Step rail */}
          <div className="px-6 sm:px-10 py-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
            <div className="flex items-start">
              {TABS.map((tab, idx) => {
                const isActive = idx === tabIndex;
                const isDone = idx < tabIndex;
                const isClickable = idx <= tabIndex;
                return (
                  <div key={tab.key} className="flex items-start flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => isClickable && setActiveTab(tab.key)}
                      disabled={!isClickable}
                      className={`flex flex-col items-center gap-2 group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span
                        className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 border-2 transition-colors ${mono} text-xs font-semibold
                          ${
                            isDone
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : isActive
                                ? 'bg-primary-600 border-primary-600 text-white shadow-[0_0_0_4px_var(--color-primary-100)] dark:shadow-[0_0_0_4px_rgba(37,99,235,0.25)]'
                                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)]'
                          }`}
                      >
                        {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : String(idx + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`hidden sm:block text-[10px] uppercase tracking-[0.14em] text-center whitespace-nowrap ${mono} ${
                          isActive || isDone ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>

                    {idx < TABS.length - 1 && (
                      <div className="flex-1 h-[2px] mt-[18px] mx-3 sm:mx-4 rounded-full bg-[var(--border-color)] relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-primary-600 rounded-full transition-all duration-300" style={{ width: idx < tabIndex ? '100%' : '0%' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="px-6 sm:px-10 py-8 min-h-[380px]">
            {activeTab === 'keyCombination' && <SelectKeyCombinationTab selectedKeys={selectedKeys} onChange={handleKeysChange} savedCombinations={combinations} onSaveCombination={saveCombination} />}
            {activeTab === 'keyValue' && <KeyValueTab selectedKeys={selectedKeys} data={formData} onChange={setFormData} customers={customers} itemGroups={itemGroups} items={items} />}
            {activeTab === 'details' && (
              <div className="space-y-8">
                <DetailsTab moduleType={moduleType} data={formData} onChange={setFormData} />
                {hasItemsTab && <ItemsTab moduleType={moduleType} data={formData} onChange={setFormData} items={items} itemUoms={itemUoms} />}
                {moduleType === 'discount' && formData.discountMainType === 'slab' && <SlabsTab data={formData} onChange={setFormData} />}
                {moduleType === 'promotion' && formData.offerType === 'free_goods' && <SlabsTab data={formData} onChange={setFormData} mode="promotion" />}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 px-6 sm:px-10 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
            <span className={`text-[11px] text-[var(--text-muted)] ${mono}`}>
              Step {String(tabIndex + 1).padStart(2, '0')} / {String(TABS.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 px-5 cursor-pointer py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              {isLastTab ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-5 cursor-pointer py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!!nextBlockedReason}
                  title={nextBlockedReason ?? undefined}
                  className="inline-flex items-center gap-1.5 px-5 cursor-pointer py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { RuleType, RuleFormData } from '../../../types/PricingPromoDiscount';
import { DetailsTab } from './tabs/DetailsTab';
import { ItemsTab } from './tabs/ItemsTab';
import { useRuleFormOptions, useRuleMutations } from '../../../hooks/usePricingPromotionRules';
import { pricingApi, promotionApi, discountApi } from '../../../api/PricingPromotionApi';

// ── Tab definitions ───────────────────────────────────────────────────────────
type TabKey = 'details' | 'items';

const LABELS: Record<RuleType, string> = {
  pricing: 'Pricing',
  promotion: 'Promotion',
  discount: 'Discount',
};

const DEFAULT_FORM: RuleFormData = {
  name: '',
  customerId: '',
  itemGroupId: '',
  startDate: '',
  endDate: '',
  price: '',
  offerType: '',
  offerValue: '',
  status: true,
  items: [],
};

function apiFor(type: RuleType) {
  if (type === 'pricing') return pricingApi;
  if (type === 'promotion') return promotionApi;
  return discountApi;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  moduleType: RuleType;
  listPath: string; // e.g. "/promotion"
}

// ── Component ─────────────────────────────────────────────────────────────────
export function PricingPromoDiscountAdd({ moduleType, listPath }: Props) {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEditing = Boolean(uuid);
  const hasItemsTab = moduleType !== 'pricing';

  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [formData, setFormData] = useState<RuleFormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { customers, itemGroups, items, itemUoms } = useRuleFormOptions();
  const { createMutation, updateMutation } = useRuleMutations(moduleType);

  useEffect(() => {
    if (!uuid) return;
    apiFor(moduleType).getByUuid(uuid).then((rule) => {
      setFormData({
        name: rule.name,
        customerId: rule.customerId ?? '',
        itemGroupId: rule.itemGroupId ?? '',
        startDate: rule.startDate,
        endDate: rule.endDate,
        price: rule.price != null ? String(rule.price) : '',
        offerType: rule.offerType ?? '',
        offerValue: rule.offerValue != null ? String(rule.offerValue) : '',
        status: rule.status,
        items: rule.items ?? [],
      });
    });
  }, [uuid, moduleType]);

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'details', label: 'Details' },
    ...(hasItemsTab ? [{ key: 'items' as TabKey, label: 'Items' }] : []),
  ];
  const tabIndex = TABS.findIndex((t) => t.key === activeTab);
  const isLastTab = tabIndex === TABS.length - 1;

  function goNext() {
    if (!isLastTab) setActiveTab(TABS[tabIndex + 1].key);
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

  // ── Tab header style ────────────────────────────────────────────────────────
  function tabCls(key: TabKey) {
    const isActive = key === activeTab;
    return [
      'relative px-8 py-3 text-sm font-medium transition-colors select-none whitespace-nowrap',
      isActive
        ? 'text-primary-600 dark:text-primary-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-600 dark:after:bg-primary-400 after:rounded-t'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
    ].join(' ');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Page Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <svg
          className="w-5 h-5 text-[var(--text-secondary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          {isEditing ? 'Edit' : 'Add'} {LABELS[moduleType]}
        </h1>
      </div>

      {/* Card */}
      <div className="px-6 py-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
          {/* Tab strip */}
          <div className="flex justify-center items-center border-b border-[var(--border-color)] overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={tabCls(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-6 py-6 min-h-[380px]">
            {activeTab === 'details' && (
              <DetailsTab
                moduleType={moduleType}
                data={formData}
                onChange={setFormData}
                customers={customers}
                itemGroups={itemGroups}
              />
            )}
            {activeTab === 'items' && hasItemsTab && (
              <ItemsTab data={formData} onChange={setFormData} items={items} itemUoms={itemUoms} />
            )}
          </div>

          {/* Footer divider */}
          <div className="border-t border-[var(--border-color)]" />

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <button
              type="button"
              onClick={goBack}
              className="px-5 cursor-pointer py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
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
                className="px-5 cursor-pointer py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

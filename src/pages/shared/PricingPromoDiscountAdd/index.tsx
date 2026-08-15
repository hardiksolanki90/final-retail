import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  ModuleType,
  SelectKeyCombinationData,
  KeyValueData,
  ModuleDetailData,
} from '../../../types/PricingPromoDiscount';
import { SelectKeyCombinationTab } from './tabs/SelectKeyCombinationTab';
import { KeyValueTab } from './tabs/KeyValueTab';
import { ModuleDetailTab } from './tabs/ModuleDetailTab';

// ── Tab definitions ───────────────────────────────────────────────────────────
type TabKey = 'keys' | 'keyValue' | 'module';

interface TabDef {
  key: TabKey;
  label: (moduleType: ModuleType) => string;
}

const TABS: TabDef[] = [
  { key: 'keys', label: () => 'Select Key Combination' },
  { key: 'keyValue', label: () => 'Key Value' },
  { key: 'module', label: (m) => m }, // dynamic: "Promotion" | "Pricing" | "Discount"
];

// ── Default state per-tab ─────────────────────────────────────────────────────
const DEFAULT_KEYS: SelectKeyCombinationData = {
  selectedCombination: 'customer_material',
  location: { country: false, region: false, area: false, route: false },
  customer: { salesOrganisation: false, channel: false, customerCategory: false, customer: true },
  item: { majorCategory: false, itemGroup: false },
};

const DEFAULT_KEY_VALUE: KeyValueData = { customerId: 'c1', itemGroupId: 'ig1' };

const DEFAULT_MODULE: ModuleDetailData = {
  name: '',
  startDate: '',
  endDate: '',
  orderType: '',
  offerType: '',
  orderItems: [
    { id: '1', itemName: 'item1', quantity: '2', uom: '', price: '33' },
    { id: '2', itemName: '', quantity: '', uom: '', price: '' },
  ],
  offerItems: [
    { id: '3', itemName: 'item2', uom: '', offeredQuantity: '2' },
    { id: '4', itemName: '', uom: '', offeredQuantity: '' },
  ],
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  moduleType: ModuleType;
  listPath: string; // e.g. "/promotion"
}

// ── Component ─────────────────────────────────────────────────────────────────
export function PricingPromoDiscountAdd({ moduleType, listPath }: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('keys');
  const [keysData, setKeysData] = useState<SelectKeyCombinationData>(DEFAULT_KEYS);
  const [keyValueData, setKeyValueData] = useState<KeyValueData>(DEFAULT_KEY_VALUE);
  const [moduleData, setModuleData] = useState<ModuleDetailData>(DEFAULT_MODULE);

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

  function handleSave() {
    console.log('Saving', moduleType, { keysData, keyValueData, moduleData });
    // TODO: call API
    navigate(listPath);
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
          Add {moduleType}
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
                {tab.label(moduleType)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-6 py-6 min-h-[380px]">
            {activeTab === 'keys' && (
              <SelectKeyCombinationTab data={keysData} onChange={setKeysData} />
            )}
            {activeTab === 'keyValue' && (
              <KeyValueTab data={keyValueData} onChange={setKeyValueData} />
            )}
            {activeTab === 'module' && (
              <ModuleDetailTab
                moduleType={moduleType}
                data={moduleData}
                onChange={setModuleData}
              />
            )}
          </div>

          {/* Footer divider */}
          <div className="border-t border-[var(--border-color)]" />

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Back
            </button>

            {isLastTab ? (
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Save
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
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

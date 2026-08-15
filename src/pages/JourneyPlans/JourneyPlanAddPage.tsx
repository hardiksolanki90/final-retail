import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChevronLeft } from 'lucide-react';
import type { JourneyPlanFullFormData } from '../../types/JourneyPlan';
import { OverviewTab } from './tabs/OverviewTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { CustomersTab } from './tabs/CustomersTab';

// ── Tab definitions ───────────────────────────────────────────────────────────
type TabKey = 'overview' | 'schedule' | 'customers';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'customers', label: 'Customers' },
];

// ── Default values ────────────────────────────────────────────────────────────
const DEFAULT_VALUES: JourneyPlanFullFormData = {
  journeyName: '',
  description: '',
  startDate: '',
  noEnd: false,
  endDate: '',
  startTime: '',
  endTime: '',
  journeyPlanBase: 'day_wise',
  selectedWeeks: [],
  firstDayOfWeek: 'monday',
  enforceFlag: false,
  merchandiserId: '',
  dayCustomers: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export function JourneyPlanAddPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<JourneyPlanFullFormData>({ defaultValues: DEFAULT_VALUES });

  // ── Tab navigation helpers ─────────────────────────────────────────────────
  const tabIndex = TABS.findIndex((t) => t.key === activeTab);

  async function goNext() {
    // Validate current tab fields before advancing
    let fieldsToValidate: (keyof JourneyPlanFullFormData)[] = [];
    if (activeTab === 'overview') {
      fieldsToValidate = ['journeyName', 'startDate', 'endDate'];
    } else if (activeTab === 'schedule') {
      fieldsToValidate = ['merchandiserId'];
    }
    const valid = await trigger(fieldsToValidate);
    if (!valid) return;
    if (tabIndex < TABS.length - 1) setActiveTab(TABS[tabIndex + 1].key);
  }

  function goBack() {
    if (tabIndex > 0) {
      setActiveTab(TABS[tabIndex - 1].key);
    } else {
      navigate(-1);
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = (data: JourneyPlanFullFormData) => {
    console.log('Journey Plan submitted:', data);
    // TODO: call API
    navigate('/journey-plan');
  };

  // ── Tab header style ───────────────────────────────────────────────────────
  function tabCls(key: TabKey) {
    const isActive = key === activeTab;
    return [
      'relative px-8 py-3 text-sm font-medium transition-colors select-none',
      isActive
        ? 'text-primary-600 dark:text-primary-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-600 dark:after:bg-primary-400 after:rounded-t'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
    ].join(' ');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Page Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        {/* Stack icon */}
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
          Add Journey Plan
        </h1>
      </div>

      {/* Card */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            {/* Tab strip */}
            <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={tabCls(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="px-6 py-6 min-h-[400px]">
              {activeTab === 'overview' && (
                <OverviewTab
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />
              )}
              {activeTab === 'schedule' && (
                <ScheduleTab
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />
              )}
              {activeTab === 'customers' && (
                <CustomersTab watch={watch} setValue={setValue} />
              )}
            </div>

            {/* Horizontal rule separator before footer */}
            <div className="border-t border-[var(--border-color)]" />

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--bg-card)]">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Back
              </button>

              {activeTab !== 'customers' ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Add Journey'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Check, Map, ChevronLeft } from 'lucide-react';
import type { JourneyPlanFullFormData } from '../../types/JourneyPlan';
import { OverviewTab } from './tabs/OverviewTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { CustomersTab } from './tabs/CustomersTab';
import { useJourneyPlanFormOptions, useJourneyPlanMutations } from '../../hooks/JourneyPlans/useJourneyPlans';
import { CancelButton, SaveButton, Button } from '../../components/ui/Button';

// ── Step definitions ────────────────────────────────────────────────────────
type StepKey = 'overview' | 'schedule' | 'customers';

const STEPS: { key: StepKey; label: string; description: string }[] = [
  { key: 'overview', label: 'Overview', description: 'Name & duration' },
  { key: 'schedule', label: 'Schedule', description: 'Frequency & owner' },
  { key: 'customers', label: 'Customers', description: 'Visit sequence' },
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
  const [activeStep, setActiveStep] = useState<StepKey>('overview');
  const [visited, setVisited] = useState<Set<StepKey>>(new Set(['overview']));
  const { merchandisers, customers, isLoading: optionsLoading } = useJourneyPlanFormOptions();
  const { createMutation } = useJourneyPlanMutations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<JourneyPlanFullFormData>({ defaultValues: DEFAULT_VALUES });

  const stepIndex = STEPS.findIndex((s) => s.key === activeStep);

  function goToStep(key: StepKey) {
    setActiveStep(key);
    setVisited((prev) => new Set(prev).add(key));
  }

  async function goNext() {
    let fieldsToValidate: (keyof JourneyPlanFullFormData)[] = [];
    if (activeStep === 'overview') {
      fieldsToValidate = ['journeyName', 'startDate', 'endDate'];
    } else if (activeStep === 'schedule') {
      fieldsToValidate = ['merchandiserId'];
    }
    const valid = await trigger(fieldsToValidate);
    if (!valid) return;
    if (stepIndex < STEPS.length - 1) goToStep(STEPS[stepIndex + 1].key);
  }

  function goBack() {
    if (stepIndex > 0) {
      goToStep(STEPS[stepIndex - 1].key);
    } else {
      navigate(-1);
    }
  }

  const onSubmit = async (data: JourneyPlanFullFormData) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/journey-plan');
    } catch {
      // toast already shown by the mutation's onError handler
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Page Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
          <Map className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">
            Add Journey Plan
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Define a recurring visit route for a merchandiser
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            {/* Stepper header */}
            <div className="px-6 sm:px-10 py-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
              <div className="flex items-start">
                {STEPS.map((step, idx) => {
                  const isActive = step.key === activeStep;
                  const isDone = visited.has(step.key) && idx < stepIndex;
                  const isClickable = visited.has(step.key);

                  return (
                    <div key={step.key} className="flex items-start flex-1 last:flex-none">
                      <button
                        type="button"
                        onClick={() => isClickable && goToStep(step.key)}
                        disabled={!isClickable}
                        className={`flex items-center gap-3 text-left group ${
                          isClickable ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold shrink-0 border-2 transition-colors
                            ${
                              isDone
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : isActive
                                ? 'bg-primary-600 border-primary-600 text-white shadow-[0_0_0_4px_var(--color-primary-100)] dark:shadow-[0_0_0_4px_rgba(37,99,235,0.25)]'
                                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'
                            }`}
                        >
                          {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : idx + 1}
                        </span>
                        <span className="hidden sm:block">
                          <span
                            className={`block text-sm font-semibold ${
                              isActive || isDone ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="block text-xs text-[var(--text-secondary)]">
                            {step.description}
                          </span>
                        </span>
                      </button>

                      {idx < STEPS.length - 1 && (
                        <div className="flex-1 h-[2px] mt-[18px] mx-3 sm:mx-4 rounded-full bg-[var(--border-color)] relative overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-primary-600 rounded-full transition-all duration-300"
                            style={{ width: idx < stepIndex ? '100%' : '0%' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step content */}
            <div className="px-6 sm:px-10 py-8 min-h-[420px]">
              {activeStep === 'overview' && (
                <OverviewTab
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />
              )}
              {activeStep === 'schedule' && (
                <ScheduleTab
                  control={control}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  merchandisers={merchandisers}
                  merchandisersLoading={optionsLoading}
                />
              )}
              {activeStep === 'customers' && (
                <CustomersTab watch={watch} setValue={setValue} customers={customers} />
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-3 px-6 sm:px-10 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
              <span className="text-xs text-[var(--text-secondary)]">
                Step {stepIndex + 1} of {STEPS.length}
              </span>
              <div className="flex items-center gap-3">
                <CancelButton type="button" onClick={goBack}>
                  {stepIndex === 0 ? 'Cancel' : 'Back'}
                </CancelButton>

                {activeStep !== 'customers' ? (
                  <Button type="button" onClick={goNext}>
                    Next
                  </Button>
                ) : (
                  <SaveButton type="submit" isLoading={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Add Journey'}
                  </SaveButton>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

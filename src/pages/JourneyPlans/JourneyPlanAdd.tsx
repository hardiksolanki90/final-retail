import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Check, Map, ChevronLeft } from 'lucide-react';
import type { JourneyPlanFullFormData } from '../../types/JourneyPlan';
import { OverviewTab } from './tabs/OverviewTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { CustomersTab } from './tabs/CustomersTab';
import { useJourneyPlanDetail, useJourneyPlanFormOptions, useJourneyPlanMutations } from '../../hooks/JourneyPlans/useJourneyPlans';
import { CancelButton, SaveButton, Button } from '../../components/ui/Button';
import { PageLoadError } from '../../components/ui/PageLoader';
import { FormSkeleton, Skeleton, SkeletonRegion } from '../../components/ui/skeleton';
import { isDetailLoading } from '../../hooks/useEntityDetail';

// ── Step definitions ────────────────────────────────────────────────────────
type StepKey = 'overview' | 'schedule' | 'customers';

const STEPS: { key: StepKey; label: string; description: string }[] = [
  { key: 'overview', label: 'Overview', description: 'Name & duration' },
  { key: 'schedule', label: 'Schedule', description: 'Frequency & owner' },
  { key: 'customers', label: 'Customers', description: 'Visit sequence' },
];

/**
 * Shown while an edited plan loads: the real header and step labels (they don't depend on the record),
 * with placeholder content for the first step (Overview: identity, then the schedule window).
 */
function JourneyPlanSkeleton() {
  return (
    <SkeletonRegion label="Loading journey plan" className="min-h-screen bg-[var(--bg-primary)]">
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div>
          <h1 className="text-lg font-semibold leading-tight text-[var(--text-primary)]">Edit Journey Plan</h1>
          <p className="text-xs text-[var(--text-secondary)]">Define a recurring visit route for a merchandiser</p>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
          <div className="rounded-t-xl border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40 px-6 py-6 sm:px-10">
            <div className="flex items-start">
              {STEPS.map((step, idx) => (
                <div key={step.key} className="flex flex-1 items-start last:flex-none">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <span className="hidden sm:block">
                      <span className="block text-sm font-semibold text-[var(--text-secondary)]">{step.label}</span>
                      <span className="block text-xs text-[var(--text-secondary)]">{step.description}</span>
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && <div className="mx-3 mt-[18px] h-[2px] flex-1 rounded-full bg-[var(--border-color)] sm:mx-4" />}
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-[420px] space-y-8 px-6 py-8 sm:px-10">
            <FormSkeleton bare fields={['section', 'input', 'textarea-sm']} />
            <FormSkeleton bare fields={['section', ['date', 'date'], ['date', 'date']]} />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-b-xl border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/40 px-6 py-4 sm:px-10">
            <span className="text-xs text-[var(--text-secondary)]">Step 1 of {STEPS.length}</span>
            <div className="flex items-center gap-3">
              <Skeleton className="h-[38px] w-20 rounded-lg" />
              <Skeleton className="h-[38px] w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}

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
  salesmanId: '',
  dayCustomers: {},
};

// ── Component ─────────────────────────────────────────────────────────────────
export function JourneyPlanAdd() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEditing = Boolean(uuid);
  const [activeStep, setActiveStep] = useState<StepKey>('overview');
  const [visited, setVisited] = useState<Set<StepKey>>(new Set(['overview']));
  const { createMutation, updateMutation } = useJourneyPlanMutations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JourneyPlanFullFormData>({ defaultValues: DEFAULT_VALUES });

  const selectedSalesmanId = watch('salesmanId');
  const numericSalesmanId = selectedSalesmanId ? Number(selectedSalesmanId) : undefined;
  const {
    merchandisers,
    merchandisersLoading,
    merchandisersLoadingMore,
    merchandisersHasMore,
    onMerchandisersLoadMore,
    onMerchandisersSearchChange,
    customers,
    customersLoading,
    customersLoadingMore,
    customersHasMore,
    onCustomersLoadMore,
    onCustomersSearchChange,
  } = useJourneyPlanFormOptions(numericSalesmanId);

  // Edit: fill the form from the cached details. Any fetch shows the loader (below), so a refresh never overwrites typing.
  const planQuery = useJourneyPlanDetail(uuid);
  const plan = planQuery.data;
  const planLoading = isDetailLoading(planQuery, uuid);
  const planFailed = planQuery.isError;
  useEffect(() => {
    if (plan) reset(plan);
  }, [plan, reset]);

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
      fieldsToValidate = ['salesmanId'];
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
      if (isEditing && uuid) {
        await updateMutation.mutateAsync({ uuid, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/journey-plan');
    } catch {
      // toast already shown by the mutation's onError handler
    }
  };

  if (uuid && planLoading) return <JourneyPlanSkeleton />;
  if (uuid && !plan && planFailed) return <PageLoadError label="Failed to load the journey plan." onBack={() => navigate(-1)} />;

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
          <h1 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">{isEditing ? 'Edit Journey Plan' : 'Add Journey Plan'}</h1>
          <p className="text-xs text-[var(--text-secondary)]">Define a recurring visit route for a merchandiser</p>
        </div>
      </div>

      {/* Card */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm">
            {/* Stepper header */}
            <div className="px-6 sm:px-10 py-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40 rounded-t-xl">
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
                        className={`flex items-center gap-3 text-left group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
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
                          <span className={`block text-sm font-semibold ${isActive || isDone ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{step.label}</span>
                          <span className="block text-xs text-[var(--text-secondary)]">{step.description}</span>
                        </span>
                      </button>

                      {idx < STEPS.length - 1 && (
                        <div className="flex-1 h-[2px] mt-[18px] mx-3 sm:mx-4 rounded-full bg-[var(--border-color)] relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-primary-600 rounded-full transition-all duration-300" style={{ width: idx < stepIndex ? '100%' : '0%' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step content */}
            <div className="px-6 sm:px-10 py-8 min-h-[420px]">
              {activeStep === 'overview' && <OverviewTab control={control} register={register} errors={errors} watch={watch} setValue={setValue} />}
              {activeStep === 'schedule' && (
                <ScheduleTab
                  control={control}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  merchandisers={merchandisers}
                  merchandisersLoading={merchandisersLoading}
                  merchandisersLoadingMore={merchandisersLoadingMore}
                  merchandisersHasMore={merchandisersHasMore}
                  onMerchandisersLoadMore={onMerchandisersLoadMore}
                  onMerchandisersSearchChange={onMerchandisersSearchChange}
                />
              )}
              {activeStep === 'customers' && (
                <CustomersTab
                  watch={watch}
                  setValue={setValue}
                  customers={customers}
                  customersLoading={customersLoading}
                  customersLoadingMore={customersLoadingMore}
                  customersHasMore={customersHasMore}
                  onCustomersLoadMore={onCustomersLoadMore}
                  onCustomersSearchChange={onCustomersSearchChange}
                />
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-3 px-6 sm:px-10 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/40 rounded-b-xl">
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
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Journey' : 'Add Journey'}
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

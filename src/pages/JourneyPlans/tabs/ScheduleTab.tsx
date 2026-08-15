import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import type {
  JourneyPlanFullFormData,
  WeekNumber,
  DayOfWeek,
} from '../../../types/JourneyPlan';

interface Props {
  register: UseFormRegister<JourneyPlanFullFormData>;
  errors: FieldErrors<JourneyPlanFullFormData>;
  watch: UseFormWatch<JourneyPlanFullFormData>;
  setValue: UseFormSetValue<JourneyPlanFullFormData>;
}

const WEEKS: { key: WeekNumber; label: string }[] = [
  { key: 'week1', label: 'Week 1' },
  { key: 'week2', label: 'Week 2' },
  { key: 'week3', label: 'Week 3' },
  { key: 'week4', label: 'Week 4' },
  { key: 'week5', label: 'Week 5' },
];

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

// Sample merchandisers – replace with API call when available
const MERCHANDISERS = [
  { value: '1', label: 'Salesperson A' },
  { value: '2', label: 'Salesperson B' },
  { value: '3', label: 'Salesperson C' },
];

const sectionLabel = 'text-sm font-medium text-[var(--text-primary)] mb-3 block';
const radioCircle =
  'w-4 h-4 accent-gray-900 dark:accent-white cursor-pointer';

export function ScheduleTab({ register, errors, watch, setValue }: Props) {
  const journeyPlanBase = watch('journeyPlanBase');
  const selectedWeeks = watch('selectedWeeks') ?? [];
  const firstDayOfWeek = watch('firstDayOfWeek');
  const enforceFlag = watch('enforceFlag');

  function toggleWeek(week: WeekNumber) {
    if (selectedWeeks.includes(week)) {
      setValue(
        'selectedWeeks',
        selectedWeeks.filter((w) => w !== week)
      );
    } else {
      setValue('selectedWeeks', [...selectedWeeks, week]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Journey Plan Base */}
      <div>
        <label className={sectionLabel}>Select Journey Plan Base</label>
        <div className="flex gap-10">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
            <input
              type="radio"
              value="day_wise"
              checked={journeyPlanBase === 'day_wise'}
              onChange={() => setValue('journeyPlanBase', 'day_wise')}
              className={radioCircle}
            />
            Day Wise
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
            <input
              type="radio"
              value="week_wise"
              checked={journeyPlanBase === 'week_wise'}
              onChange={() => setValue('journeyPlanBase', 'week_wise')}
              className={radioCircle}
            />
            Week Wise
          </label>
        </div>
      </div>

      {/* Select weeks of a month — enabled only when Week Wise is selected */}
      <div className={journeyPlanBase !== 'week_wise' ? 'opacity-40 pointer-events-none select-none' : ''}>
        <label className={sectionLabel}>Select weeks of a month</label>
        <div className="grid grid-cols-3 gap-y-3 gap-x-6">
          {WEEKS.map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2 text-sm text-[var(--text-primary)] ${
                journeyPlanBase === 'week_wise' ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedWeeks.includes(key)}
                onChange={() => toggleWeek(key)}
                disabled={journeyPlanBase !== 'week_wise'}
                className={`w-4 h-4 rounded ${
                  journeyPlanBase === 'week_wise'
                    ? 'accent-gray-900 dark:accent-white cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Select first day of a week */}
      <div>
        <label className={sectionLabel}>Select first day of a week</label>
        <div className="grid grid-cols-3 gap-y-3 gap-x-6">
          {DAYS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]"
            >
              <input
                type="radio"
                value={key}
                checked={firstDayOfWeek === key}
                onChange={() => setValue('firstDayOfWeek', key)}
                className={radioCircle}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Enforce Flag */}
      <div>
        <label className={sectionLabel}>Enforce Flag</label>
        <div className="flex gap-10">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
            <input
              type="radio"
              checked={enforceFlag === true}
              onChange={() => setValue('enforceFlag', true)}
              className={radioCircle}
            />
            Yes
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
            <input
              type="radio"
              checked={enforceFlag === false}
              onChange={() => setValue('enforceFlag', false)}
              className={radioCircle}
            />
            No
          </label>
        </div>
      </div>

      {/* Select Merchandiser */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Select Merchandiser <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            {...register('merchandiserId', { required: 'Merchandiser is required' })}
            className="block w-full px-3 py-2 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none pr-8 transition-colors"
          >
            <option value="">Select Options</option>
            {MERCHANDISERS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {/* Chevron icon */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg
              className="w-4 h-4 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.merchandiserId && (
          <p className="text-red-500 text-xs mt-1">{errors.merchandiserId.message}</p>
        )}
      </div>
    </div>
  );
}

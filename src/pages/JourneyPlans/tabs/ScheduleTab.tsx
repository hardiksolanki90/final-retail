import { Controller, type Control, type FieldErrors, type UseFormWatch, type UseFormSetValue } from 'react-hook-form';
import type {
  JourneyPlanFullFormData,
  WeekNumber,
  DayOfWeek,
} from '../../../types/JourneyPlan';
import { Checkbox } from '../../../components/ui/Checkbox';
import { TwoOptionToggle } from '../../../components/ui/TwoOptionToggle';
import { SectionLabel } from '../../../components/ui/SectionLabel';
import { Select } from '../../../components/ui/Select';

interface Props {
  control: Control<JourneyPlanFullFormData>;
  errors: FieldErrors<JourneyPlanFullFormData>;
  watch: UseFormWatch<JourneyPlanFullFormData>;
  setValue: UseFormSetValue<JourneyPlanFullFormData>;
  merchandisers: { value: string; label: string }[];
  merchandisersLoading?: boolean;
}

const WEEKS: { key: WeekNumber; label: string }[] = [
  { key: 'week1', label: 'Week 1' },
  { key: 'week2', label: 'Week 2' },
  { key: 'week3', label: 'Week 3' },
  { key: 'week4', label: 'Week 4' },
  { key: 'week5', label: 'Week 5' },
];

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export function ScheduleTab({ control, errors, watch, setValue, merchandisers, merchandisersLoading }: Props) {
  const journeyPlanBase = watch('journeyPlanBase');
  const selectedWeeks = watch('selectedWeeks') ?? [];
  const firstDayOfWeek = watch('firstDayOfWeek');
  const enforceFlag = watch('enforceFlag');

  function toggleWeek(week: WeekNumber) {
    if (selectedWeeks.includes(week)) {
      setValue('selectedWeeks', selectedWeeks.filter((w) => w !== week));
    } else {
      setValue('selectedWeeks', [...selectedWeeks, week]);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Recurrence base */}
      <div className="space-y-3">
        <SectionLabel title="Recurrence" />
        <TwoOptionToggle
          value={journeyPlanBase === 'day_wise'}
          onChange={(v) => setValue('journeyPlanBase', v ? 'day_wise' : 'week_wise')}
          trueLabel="Day Wise"
          falseLabel="Week Wise"
        />
      </div>

      {/* Weeks of month — only relevant for Week Wise */}
      <div className={`space-y-3 transition-opacity ${journeyPlanBase !== 'week_wise' ? 'opacity-40 pointer-events-none' : ''}`}>
        <SectionLabel title="Weeks of a Month" />
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {WEEKS.map(({ key, label }) => (
            <Checkbox
              key={key}
              label={label}
              checked={selectedWeeks.includes(key)}
              onChange={() => toggleWeek(key)}
              disabled={journeyPlanBase !== 'week_wise'}
            />
          ))}
        </div>
      </div>

      {/* First day of week — chip selector */}
      <div className="space-y-3">
        <SectionLabel title="First Day of the Week" />
        <div className="flex flex-wrap gap-2">
          {DAYS.map(({ key, label, short }) => {
            const isActive = firstDayOfWeek === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setValue('firstDayOfWeek', key)}
                title={label}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isActive
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600'
                }`}
              >
                {short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Enforce flag */}
      <div className="space-y-3">
        <SectionLabel title="Enforce Visit" />
        <TwoOptionToggle
          value={enforceFlag === true}
          onChange={(v) => setValue('enforceFlag', v)}
          trueLabel="Yes"
          falseLabel="No"
        />
      </div>

      {/* Merchandiser */}
      <div className="space-y-3">
        <SectionLabel title="Assignment" />
        <Controller
          name="merchandiserId"
          control={control}
          rules={{ required: 'Merchandiser is required' }}
          render={({ field }) => (
            <Select
              label="Select Merchandiser*"
              value={field.value}
              onChange={(e) => field.onChange(String(e.target.value))}
              options={merchandisers}
              placeholder="Select merchandiser"
              isLoading={merchandisersLoading}
              error={errors.merchandiserId?.message}
            />
          )}
        />
      </div>
    </div>
  );
}

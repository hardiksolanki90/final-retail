import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { JourneyPlanFullFormData } from '../../../types/JourneyPlan';
import { Input } from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { SectionLabel } from '../../../components/ui/SectionLabel';

interface Props {
  register: UseFormRegister<JourneyPlanFullFormData>;
  errors: FieldErrors<JourneyPlanFullFormData>;
  watch: UseFormWatch<JourneyPlanFullFormData>;
  setValue: UseFormSetValue<JourneyPlanFullFormData>;
}

const textareaCls =
  'block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm';

export function OverviewTab({ register, errors, watch, setValue }: Props) {
  const noEnd = watch('noEnd');

  return (
    <div className="max-w-2xl space-y-8">
      {/* Identity */}
      <div className="space-y-4">
        <SectionLabel title="Journey Identity" />

        <Input
          label="Journey Name"
          {...register('journeyName', { required: 'Journey Name is required' })}
          error={errors.journeyName?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className={textareaCls}
            placeholder="Optional notes about this journey plan..."
          />
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-4">
        <SectionLabel title="Schedule Window" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            {...register('startDate', { required: 'Start Date is required' })}
            error={errors.startDate?.message}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-sm font-medium ${noEnd ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                End Date
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <Checkbox
                  checked={noEnd}
                  onChange={(e) => {
                    setValue('noEnd', e.target.checked);
                    if (e.target.checked) setValue('endDate', '');
                  }}
                />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">No End</span>
              </label>
            </div>
            <Input
              type="date"
              {...register('endDate', {
                validate: (val) => {
                  if (!noEnd && !val) return 'End Date is required';
                  return true;
                },
              })}
              disabled={noEnd}
              error={errors.endDate?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input type="time" label="Start Time" {...register('startTime')} />
          <Input type="time" label="End Time" {...register('endTime')} />
        </div>
      </div>
    </div>
  );
}

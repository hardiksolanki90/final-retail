import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Infinity as InfinityIcon } from 'lucide-react';
import type { JourneyPlanFullFormData } from '../../../types/JourneyPlan';
import { Input } from '../../../components/ui/Input';
import { SectionLabel } from '../../../components/ui/SectionLabel';
import { DatePicker } from '../../../components/ui/DatePicker';
import { format, parse } from 'date-fns';

interface Props {
  control: Control<JourneyPlanFullFormData>;
  register: UseFormRegister<JourneyPlanFullFormData>;
  errors: FieldErrors<JourneyPlanFullFormData>;
  watch: UseFormWatch<JourneyPlanFullFormData>;
  setValue: UseFormSetValue<JourneyPlanFullFormData>;
}

const textareaCls =
  'block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm';

export function OverviewTab({ register, errors, watch, setValue, control }: Props) {
  const noEnd = watch('noEnd');

  return (
    <div className="space-y-8">
      {/* Identity */}
      <div className="space-y-4">
        <SectionLabel title="Journey Identity" />

        <Input label="Journey Name" required {...register('journeyName', { required: 'Journey Name is required' })} error={errors.journeyName?.message} />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea {...register('description')} rows={3} className={textareaCls} placeholder="Optional notes about this journey plan..." />
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-4">
        <SectionLabel title="Schedule Window" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="startDate"
            control={control}
            rules={{ required: 'Start Date is required' }}
            render={({ field }) => (
              <DatePicker
                label="Start Date"
                required
                selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : null}
                onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                dateFormat="MMM d, yyyy"
                placeholderText="Select start date"
                error={errors.startDate?.message}
              />
            )}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date <span className="text-red-500 font-bold">*</span>
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={noEnd || false}
                onClick={() => {
                  const isChecked = !noEnd;
                  setValue('noEnd', isChecked, { shouldValidate: true, shouldDirty: true });
                  if (isChecked) {
                    setValue('endDate', '');
                  }
                }}
                className="flex items-center gap-1.5 group"
              >
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">No End Date</span>
                <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${noEnd ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${noEnd ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                </span>
              </button>
            </div>

            {noEnd ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 text-sm">
                <InfinityIcon className="w-4 h-4 shrink-0" />
                <span>Ongoing — runs indefinitely</span>
              </div>
            ) : (
              <Controller
                name="endDate"
                control={control}
                rules={{
                  validate: (val) => {
                    if (!noEnd && !val) return 'End Date is required';
                    return true;
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : null}
                    onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select end date"
                    error={errors.endDate?.message}
                  />
                )}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Start Time"
                showTimeSelect
                showTimeSelectOnly
                selected={field.value ? parse(field.value, 'HH:mm', new Date()) : null}
                onChange={(date) => field.onChange(date ? format(date, 'HH:mm') : '')}
                timeCaption="Time"
                dateFormat="h:mm aa"
                placeholderText="Select start time"
                error={errors.startTime?.message}
              />
            )}
          />
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="End Time"
                showTimeSelect
                showTimeSelectOnly
                selected={field.value ? parse(field.value, 'HH:mm', new Date()) : null}
                onChange={(date) => field.onChange(date ? format(date, 'HH:mm') : '')}
                timeCaption="Time"
                dateFormat="h:mm aa"
                placeholderText="Select end time"
                error={errors.endTime?.message}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

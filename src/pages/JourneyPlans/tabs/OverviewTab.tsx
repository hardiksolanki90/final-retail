import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { JourneyPlanFullFormData } from '../../../types/JourneyPlan';

interface Props {
  register: UseFormRegister<JourneyPlanFullFormData>;
  errors: FieldErrors<JourneyPlanFullFormData>;
  watch: UseFormWatch<JourneyPlanFullFormData>;
  setValue: UseFormSetValue<JourneyPlanFullFormData>;
}

const inputCls =
  'block w-full px-3 py-2 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors';

const labelCls = 'block text-sm font-medium text-[var(--text-primary)] mb-1';

export function OverviewTab({ register, errors, watch, setValue }: Props) {
  const noEnd = watch('noEnd');

  return (
    <div className="space-y-5">
      {/* Journey Name */}
      <div>
        <label className={labelCls}>Journey Name</label>
        <input
          {...register('journeyName', { required: 'Journey Name is required' })}
          className={inputCls}
          placeholder=""
        />
        {errors.journeyName && (
          <p className="text-red-500 text-xs mt-1">{errors.journeyName.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder=""
        />
      </div>

      {/* Start Date | No End | End Date */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
        {/* Start Date */}
        <div>
          <label className={labelCls}>Start Date</label>
          <input
            type="date"
            {...register('startDate', { required: 'Start Date is required' })}
            className={inputCls}
          />
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
          )}
        </div>

        {/* No End checkbox */}
        <div className="flex flex-col items-center gap-1 pb-2">
          <label className="text-sm font-medium text-[var(--text-primary)]">No End</label>
          <input
            type="checkbox"
            {...register('noEnd')}
            onChange={(e) => {
              setValue('noEnd', e.target.checked);
              if (e.target.checked) setValue('endDate', '');
            }}
            className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className={`${labelCls} ${noEnd ? 'opacity-40' : ''}`}>End Date</label>
          <input
            type="date"
            {...register('endDate', {
              validate: (val) => {
                if (!noEnd && !val) return 'End Date is required';
                return true;
              },
            })}
            disabled={noEnd}
            className={`${inputCls} ${noEnd ? 'opacity-40 cursor-not-allowed' : ''}`}
          />
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Start Time | End Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Start Time</label>
          <input
            type="time"
            {...register('startTime')}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>End Time</label>
          <input
            type="time"
            {...register('endTime')}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

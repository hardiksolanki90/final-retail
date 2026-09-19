import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { DriverReplacementFormData } from '../../../types/DriverReplacement';

interface DriverReplacementAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DriverReplacementFormData) => void | Promise<void>;
  initialData?: DriverReplacementFormData;
  salesmanOptions: { value: number; label: string }[];
  vanOptions: { value: number; label: string }[];
  reasonOptions: { value: number; label: string }[];
}

const initialFormData: DriverReplacementFormData = {
  oldSalesmanId: '',
  newSalesmanId: '',
  oldVanId: '',
  newVanId: '',
  reasonId: '',
  date: '',
};

export function DriverReplacementAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  salesmanOptions,
  vanOptions,
  reasonOptions,
}: DriverReplacementAddProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    control,
    register,
    watch,
    setValue,
    getValues,
  } = useForm<DriverReplacementFormData>({ defaultValues: initialFormData });

  const watchedOldVanId = watch('oldVanId');
  const newVanOptions = watchedOldVanId
    ? vanOptions.filter((o) => String(o.value) !== String(watchedOldVanId))
    : vanOptions;

  useEffect(() => {
    if (initialData) reset(initialData);
    else reset(initialFormData);
  }, [initialData, isOpen, reset]);

  useEffect(() => {
    if (watchedOldVanId && String(getValues('newVanId')) === String(watchedOldVanId)) {
      setValue('newVanId', '');
    }
  }, [watchedOldVanId, getValues, setValue]);

  const onFormSubmit = async (data: DriverReplacementFormData) => {
    const payload: DriverReplacementFormData = {
      ...data,
      oldSalesmanId: data.oldSalesmanId ? Number(data.oldSalesmanId) : '',
      newSalesmanId: data.newSalesmanId ? Number(data.newSalesmanId) : '',
      oldVanId: data.oldVanId ? Number(data.oldVanId) : '',
      newVanId: data.newVanId ? Number(data.newVanId) : '',
      reasonId: data.reasonId ? Number(data.reasonId) : '',
    };
    try {
      await onSubmit(payload);
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving driver replacement' });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="driver-replacement-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Driver Replacement' : 'Add Driver Replacement'} width="w-[500px]" footer={footerContent}>
      <form id="driver-replacement-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <Controller
            name="oldSalesmanId"
            control={control}
            rules={{ required: 'Old Salesman is required' }}
            render={({ field }) => (
              <Select
                label="Old Salesman *"
                placeholder="Select salesman"
                searchable
                options={salesmanOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.oldSalesmanId?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="newSalesmanId"
            control={control}
            rules={{ required: 'New Salesman is required' }}
            render={({ field }) => (
              <Select
                label="New Salesman *"
                placeholder="Select salesman"
                searchable
                options={salesmanOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.newSalesmanId?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="oldVanId"
            control={control}
            render={({ field }) => (
              <Select
                label="Old Van"
                placeholder="Select van (optional)"
                searchable
                options={vanOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.oldVanId?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="newVanId"
            control={control}
            render={({ field }) => (
              <Select
                label="New Van"
                placeholder="Select van (optional)"
                searchable
                options={newVanOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.newVanId?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="reasonId"
            control={control}
            render={({ field }) => (
              <Select
                label="Reason"
                placeholder="Select reason (optional)"
                searchable
                options={reasonOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.reasonId?.message}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input type="date" {...register('date', { required: 'Date is required' })} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { AreaSelect } from '../../../components/ui/AreaSelect';
import { createBeat, updateBeat } from '../../../api/BeatApi';
import type { BeatFormData } from '../../../types/Beat';

interface BeatAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data?: any) => void;
  editData?: any;
}

const initialFormData: BeatFormData = {
  beatCode: '',
  beatName: '',
  areaId: null,
  status: true,
};

export function BeatAdd({ isOpen, onClose, onSubmit, editData }: BeatAddProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
  } = useForm<BeatFormData>({ defaultValues: initialFormData });

  const createMutation = useMutation({
    mutationFn: (data: BeatFormData) => createBeat(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['beat-list'] });
      queryClient.invalidateQueries({ queryKey: ['beat-all'] });
      onSubmit?.(res?.data);
    },
    onError: (error: any) => {
      setError('root', { message: error.response?.data?.message || 'Error creating beat' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: BeatFormData) => updateBeat(editData?.uuid, data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['beat-list'] });
      queryClient.invalidateQueries({ queryKey: ['beat-all'] });
      onSubmit?.(res?.data);
    },
    onError: (error: any) => {
      setError('root', { message: error.response?.data?.message || 'Error updating beat' });
    },
  });

  useEffect(() => {
    if (editData) {
      reset({
        beatCode: editData.beatCode ?? editData.code ?? '',
        beatName: editData.beatName ?? editData.name ?? '',
        areaId: editData.areaId ?? editData.area?.id ?? null,
        status: editData.status ?? true,
      });
    } else {
      reset(initialFormData);
    }
  }, [editData, isOpen, reset]);

  const onFormSubmit = async (data: BeatFormData) => {
    if (editData?.uuid) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const watchedStatus = watch('status');

  const footerContent = (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <button
          type="button"
          onClick={() => setValue('status', !watchedStatus)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            watchedStatus ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              watchedStatus ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={isSubmitting}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="beat-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Beat' : 'Add Beat'} width="w-[500px]" footer={footerContent}>
      <form id="beat-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Beat Code *</label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('beatCode', {
                required: 'Beat code is required',
                validate: (value) => (value && value.trim() !== '') || 'Beat code cannot be empty',
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. BT01"
            />
            <OrderCodeSettingsIcon
              label="Beat Code"
              value={watch('beatCode') || ''}
              onChange={(v) => setValue('beatCode', v)}
            />
          </div>
          {errors.beatCode && <p className="text-red-600 text-xs mt-1">{errors.beatCode.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beat Name *</label>
          <input
            {...register('beatName', {
              required: 'Beat name is required',
              validate: (value) => value.trim() !== '' || 'Beat name cannot be empty',
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter beat name"
          />
          {errors.beatName && <p className="text-red-600 text-xs mt-1">{errors.beatName.message}</p>}
        </div>

        <div>
          <Controller
            name="areaId"
            control={control}
            render={({ field }) => (
              <AreaSelect
                label="Area"
                error={errors.areaId?.message}
                value={field.value ?? ''}
                onChange={(val) => field.onChange(val ? Number(val) : null)}
              />
            )}
          />
        </div>
      </form>
    </Drawer>
  );
}

export default BeatAdd;

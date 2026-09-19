import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { Select } from '../../../components/ui/Select';
import { createArea, updateArea, getAreaAll } from '../../../api/AreaApi';
import type { AreaFormData } from '../../../types/Area';

interface AreaAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data?: any) => void;
  editData?: any;
}

const initialFormData: AreaFormData = {
  areaCode: '',
  areaName: '',
  parentId: null,
  status: true,
};

export function AreaAdd({ isOpen, onClose, onSubmit, editData }: AreaAddProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
    control,
  } = useForm<AreaFormData>({ defaultValues: initialFormData });

  // Fetch parent areas for dropdown — only once the drawer is actually
  // open, since AreaAdd stays mounted the whole time on AreaList.
  const { data: parentAreasData } = useQuery({
    queryKey: ['area-all'],
    queryFn: () => getAreaAll(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });
  const parentAreas = parentAreasData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: AreaFormData) => createArea(data),
    onSuccess: (res: any) => {
      // Only area-list — AreaList.tsx's table is what needs refreshing here.
      // area-all only feeds this drawer's own Parent Area dropdown, and the
      // drawer closes right after onSubmit, so refetching it was wasted.
      queryClient.invalidateQueries({ queryKey: ['area-list'] });
      onSubmit?.(res?.data);
    },
    onError: (error: any) => {
      setError('root', { message: error.response?.data?.message || 'Error creating area' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AreaFormData) => updateArea(editData?.uuid, data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['area-list'] });
      onSubmit?.(res?.data);
    },
    onError: (error: any) => {
      setError('root', { message: error.response?.data?.message || 'Error updating area' });
    },
  });

  useEffect(() => {
    if (editData) {
      reset({
        areaCode: editData.areaCode ?? editData.code ?? '',
        areaName: editData.areaName ?? editData.name ?? '',
        parentId: editData.parentId ?? null,
        status: editData.status ?? true,
      });
    } else {
      reset(initialFormData);
    }
  }, [editData, isOpen, reset]);

  const onFormSubmit = async (data: AreaFormData) => {
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
        <SaveButton type="submit" form="area-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Area' : 'Add Area'} width="w-[500px]" footer={footerContent}>
      <form id="area-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area Code *</label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('areaCode', {
                required: 'Area code is required',
                validate: (value) => (value && value.trim() !== '') || 'Area code cannot be empty',
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. AR01"
            />
            <OrderCodeSettingsIcon
              label="Area Code"
              value={watch('areaCode') || ''}
              onChange={(v) => setValue('areaCode', v)}
            />
          </div>
          {errors.areaCode && <p className="text-red-600 text-xs mt-1">{errors.areaCode.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area Name *</label>
          <input
            {...register('areaName', {
              required: 'Area name is required',
              validate: (value) => value.trim() !== '' || 'Area name cannot be empty',
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter area name"
          />
          {errors.areaName && <p className="text-red-600 text-xs mt-1">{errors.areaName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Area</label>
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                options={parentAreas
                  .filter((a: any) => a.uuid !== editData?.uuid) // exclude self
                  .map((area: any) => ({
                    value: String(area.id),
                    label: area.areaName ?? area.name,
                  }))}
                placeholder="None (Top Level)"
              />
            )}
          />
        </div>
      </form>
    </Drawer>
  );
}

export default AreaAdd;

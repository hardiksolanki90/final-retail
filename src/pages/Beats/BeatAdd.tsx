import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Drawer } from '../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { createBeat, updateBeat, getBeatAll } from '../../api/BeatApi';
import type { BeatFormData } from '../../types/Beat';

interface BeatAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  editData?: any;
}

const initialFormData: BeatFormData = {
  areaName: '',
  parentId: null,
  status: true,
};

export function BeatAdd({ isOpen, onClose, onSubmit, editData }: BeatAddProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
  } = useForm<BeatFormData>({ defaultValues: initialFormData });

  // Fetch parent areas for dropdown
  const { data: parentAreasData } = useQuery({
    queryKey: ['area-all'],
    queryFn: () => getBeatAll(),
    staleTime: 5 * 60 * 1000,
  });
  const parentAreas = parentAreasData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: BeatFormData) => createBeat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beat-list'] });
      queryClient.invalidateQueries({ queryKey: ['area-all'] });
      onSubmit?.();
    },
    onError: (error: any) => {
      setError('root', { message: error.response?.data?.message || 'Error creating area' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: BeatFormData) => updateBeat(editData?.uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beat-list'] });
      queryClient.invalidateQueries({ queryKey: ['area-all'] });
      onSubmit?.();
    },
    onError: (error: any) => {
      setError('root', { message: error.response?.data?.message || 'Error updating area' });
    },
  });

  useEffect(() => {
    if (editData) {
      reset({
        areaName: editData.areaName ?? editData.name ?? '',
        parentId: editData.parentId ?? null,
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
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>
        Cancel
      </CancelButton>
      <SaveButton type="submit" form="beat-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : editData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Area' : 'Add Area'} width="w-[500px]" footer={footerContent}>
      <form id="beat-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

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
          <select
            {...register('parentId')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">None (Top Level)</option>
            {parentAreas
              .filter((a: any) => a.uuid !== editData?.uuid) // exclude self
              .map((area: any) => (
                <option key={area.uuid ?? area.id} value={area.uuid ?? area.id}>
                  {area.areaName ?? area.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <button
            type="button"
            onClick={() => setValue('status', !watchedStatus)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${watchedStatus ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${watchedStatus ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">{watchedStatus ? 'Active' : 'Inactive'}</span>
        </div>
      </form>
    </Drawer>
  );
}

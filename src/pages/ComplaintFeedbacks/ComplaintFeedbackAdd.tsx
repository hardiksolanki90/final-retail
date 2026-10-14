import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { isAxiosError } from 'axios';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { ComplaintFeedbackFormData } from '../../types/ComplaintFeedback';
import type { SalesmanSelectOption } from '../../types/Salesman';
import type { ItemSelectOption } from '../../types/Item';
import { FormSkeleton } from '../../components/ui/skeleton';
import { getSalesmanOptions } from '../../api/SalesmanApi';
import { getItemOptions } from '../../api/ItemApi';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';
import { useComplaintFeedbackActions } from '../../hooks/ComplaintFeedbacks/useComplaintFeedbacks';

interface ComplaintFeedbackAddProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultValues: ComplaintFeedbackFormData = {
  title: '',
  merchandiserId: '',
  itemId: '',
  type: 'complaint',
  description: '',
};

export function ComplaintFeedbackAdd({ isOpen, onClose }: ComplaintFeedbackAddProps) {
  const { create } = useComplaintFeedbackActions();
  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<ComplaintFeedbackFormData>({ defaultValues });
  const type = useWatch({ control, name: 'type' });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [isOpen, reset]);

  const typeOptions = [
    { value: 'complaint', label: 'Complaint' },
    { value: 'suggestion', label: 'Suggestion' },
  ];

  const merchandiserSelect = useInfiniteSelect({
    enabled: isOpen,
    fetchPage: async (page, search) => {
      const response = await getSalesmanOptions(page, search || undefined, 25, { salesmanTypeId: 2 });
      return { items: response.data, hasMore: response.meta.has_more_pages };
    },
    mapItemToOption: (salesman: SalesmanSelectOption) => ({ value: salesman.userId, label: [salesman.salesmanCode, salesman.name].filter(Boolean).join(' - ') }),
  });

  const itemSelect = useInfiniteSelect({
    enabled: isOpen,
    fetchPage: async (page, search) => {
      const response = await getItemOptions(page, search || undefined);
      return { items: response.data, hasMore: response.meta.has_more_pages };
    },
    mapItemToOption: (item: ItemSelectOption) => item,
  });

  const onSubmit = async (data: ComplaintFeedbackFormData) => {
    try {
      await create.mutateAsync(data);
      onClose();
    } catch (error) {
      if (!isAxiosError(error)) return;
      const validation = error.response?.data?.errors as Record<string, string[]> | undefined;
      if (validation?.salesman_id?.[0]) setError('merchandiserId', { message: validation.salesman_id[0] });
      if (validation?.item_id?.[0]) setError('itemId', { message: validation.item_id[0] });
      if (validation?.title?.[0]) setError('title', { message: validation.title[0] });
      if (validation?.description?.[0]) setError('description', { message: validation.description[0] });
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Add Complaint Feedback" width="w-full sm:w-[440px]" isLoading={false} skeleton={<FormSkeleton fields={['input', 'select', 'select', 'select', 'textarea']} />}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
        <Input label="Feedback Title" {...register('title', { required: 'Feedback title is required' })} error={errors.title?.message} placeholder="Enter feedback title" required />
        <Controller name="merchandiserId" control={control} rules={{ required: 'Merchandiser is required' }} render={({ field }) => (
          <Select {...field} label="Merchandiser" options={merchandiserSelect.options} placeholder="Select merchandiser" error={errors.merchandiserId?.message} isLoading={merchandiserSelect.isLoading} hasMore={merchandiserSelect.hasMore} isLoadingMore={merchandiserSelect.isLoadingMore} onLoadMore={merchandiserSelect.onLoadMore} onSearchChange={merchandiserSelect.onSearchChange} required />
        )} />
        <Controller name="itemId" control={control} rules={{ validate: (value) => type === 'suggestion' || Boolean(value) || 'Item is required for complaints' }} render={({ field }) => (
          <Select {...field} label={`Item${type === 'suggestion' ? ' (Optional)' : ''}`} options={itemSelect.options} placeholder="Select item" error={errors.itemId?.message} isLoading={itemSelect.isLoading} hasMore={itemSelect.hasMore} isLoadingMore={itemSelect.isLoadingMore} onLoadMore={itemSelect.onLoadMore} onSearchChange={itemSelect.onSearchChange} required={type === 'complaint'} />
        )} />
        <Controller name="type" control={control} rules={{ required: 'Type is required' }} render={({ field }) => <Select {...field} label="Type" options={typeOptions} searchable={false} error={errors.type?.message} required />} />
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Description <span className="text-red-500">*</span></label>
          <textarea {...register('description', { required: 'Description is required' })} rows={5} placeholder="Enter description" className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--border-color)] pt-4">
          <CancelButton onClick={onClose} disabled={isSubmitting || create.isPending}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isSubmitting || create.isPending}>{isSubmitting || create.isPending ? 'Saving...' : 'Save'}</SaveButton>
        </div>
      </form>
    </Drawer>
  );
}

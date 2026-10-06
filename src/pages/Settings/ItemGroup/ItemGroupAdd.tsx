import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { ItemGroupFormData } from '../../../types/ItemGroup';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { reserveCodeIfAuto } from '../../../api/CodeSettingApi';
import { FormSkeleton, type FormSkeletonField } from '../../../components/ui/skeleton';

// Mirrors the form below: Code, Name.
const ITEM_GROUP_FORM_SKELETON: FormSkeletonField[] = ['code', 'input'];

interface ItemGroupAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: { initialData?: ItemGroupFormData; isLoading?: boolean };
  onEvent?: (event: any) => void;
}

const initialFormData: ItemGroupFormData = { code: '', name: '', status: true };

export function ItemGroupAdd({ isOpen, onClose, data, onEvent }: ItemGroupAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
  } = useForm<ItemGroupFormData>({ defaultValues: initialFormData });

  const watchedStatus = watch('status');
  const [codeLocked, setCodeLocked] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (formData: ItemGroupFormData) => {
    try {
      const resolvedCode = await reserveCodeIfAuto('item_group', formData.code);
      if (resolvedCode !== formData.code) {
        formData.code = resolvedCode ?? '';
        setValue('code', resolvedCode ?? '');
        setCodeLocked(true);
      }

      await onEvent?.({ eventType: initialData ? 'ItemGroupUpdated' : 'ItemGroupCreated', itemGroup: formData });
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving item group' });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <button
          type="button"
          onClick={() => setValue('status', !watchedStatus)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            watchedStatus ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${watchedStatus ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="item-group-form" disabled={isLoading || isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isLoading={isLoading}
      skeleton={<FormSkeleton fields={ITEM_GROUP_FORM_SKELETON} />}
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Item Group' : 'Add Item Group'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="item-group-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Code <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('code')}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              placeholder="Configure the system to auto-generate the code."
              disabled={codeLocked}
            />
            <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} entityKey="item_group" onLockChange={setCodeLocked} />
            {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('name', { required: 'Name is required', validate: (value) => value.trim() !== '' || 'Name cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter item group name"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}

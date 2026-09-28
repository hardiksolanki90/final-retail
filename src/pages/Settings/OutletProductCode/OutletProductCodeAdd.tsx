import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { OutletProductCodeFormData } from '../../../types/OutletProductCode';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { reserveCodeIfAuto } from '../../../api/CodeSettingApi';

interface OutletProductCodeAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OutletProductCodeFormData) => void | Promise<void>;
  initialData?: OutletProductCodeFormData | null;
  isLoading?: boolean;
}

const initialFormData: OutletProductCodeFormData = {
  name: '',
  code: '',
};

export function OutletProductCodeAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: OutletProductCodeAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue
  } = useForm<OutletProductCodeFormData>({
    defaultValues: initialFormData
  });

  const [codeLocked, setCodeLocked] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name ?? '', code: initialData.code ?? '' });
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: OutletProductCodeFormData) => {
    try {
      const resolvedCode = await reserveCodeIfAuto('outlet_product_code', data.code);
      if (resolvedCode !== data.code) {
        data.code = resolvedCode ?? '';
        setValue('code', resolvedCode ?? '');
        setCodeLocked(true);
      }

      await onSubmit(data);
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving outlet product code'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="outlet-product-code-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Outlet Product Code' : 'Add Outlet Product Code'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="outlet-product-code-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Code <span className="text-red-500 font-bold ml-0.5">*</span></label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('code')}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              placeholder="Auto-generated if empty"
              disabled={codeLocked}
            />
            <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} entityKey="outlet_product_code" onLockChange={setCodeLocked} />
            {errors.code && (
              <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500 font-bold ml-0.5">*</span></label>
          <input
            {...register('name', {
              required: 'Name is required',
              validate: value => value.trim() !== '' || 'Name cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter name"
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
      </form>
    </Drawer>
  );
}

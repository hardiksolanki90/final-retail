import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { PortfolioManagementFormData } from '../../types/PortfolioManagement';
import { X, Plus } from 'lucide-react';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface PortfolioManagementAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
  onEvent?: (data: any) => void;
}

export function PortfolioManagementAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: PortfolioManagementAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;
  const salesmen = data?.salesmen || [];
  const customers = data?.customers || [];
  const items = data?.items || [];
  
  const defaultValues: PortfolioManagementFormData = {
    salesmanId: '',
    customerId: '',
    portfolioName: '',
    targetRevenue: 0,
    startDate: '',
    endDate: '',
    items: [],
    notes: '',
    status: 'active',
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    control
  } = useForm<PortfolioManagementFormData>({
    defaultValues,
    mode: 'onBlur'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    targetQuantity: 0,
    targetValue: 0,
  });

  const watchedItems = watch('items');

  useEffect(() => {
    if (initialData && isOpen) {
      reset(initialData);
    } else if (isOpen && !initialData) {
      reset(defaultValues);
    }
  }, [initialData, isOpen, reset]);

  const handleSelectChange = (field: keyof PortfolioManagementFormData, value: string) => {
    setValue(field, value);
    clearErrors(field);
  };

  const handleAddItem = () => {
    if (!currentItem.itemId || currentItem.targetQuantity <= 0 || currentItem.targetValue <= 0) {
      return;
    }

    append({ ...currentItem });
    setCurrentItem({
      itemId: '',
      targetQuantity: 0,
      targetValue: 0,
    });
    clearErrors('items');
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
    clearErrors('items');
  };


  const onFormSubmit = async (data: PortfolioManagementFormData) => {
    try {
      // Validate that at least one item is added
      if (!data.items || data.items.length === 0) {
        setError('items', { type: 'required', message: 'At least one item is required' });
        return;
      }
      
      onEvent?.({
        eventType: initialData ? 'PortfolioManagementUpdated' : 'PortfolioManagementCreated',
        portfolioManagement: data,
      });
    } catch (error: any) {
      console.error('Error saving portfolio management:', error);
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setError(field as keyof PortfolioManagementFormData, { 
            type: 'server', 
            message: Array.isArray(message) ? message[0] : message 
          });
        });
      }
    }
  };

  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Portfolio Management' : 'Add Portfolio Management'}
      width="w-[800px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio Name</label>
                  <OrderCodeSettingsIcon label="Portfolio Name" value="" onChange={() => {}} />
                </div>
                <Input
          label="Portfolio Name"
          {...register('portfolioName', {
            required: 'Portfolio Name is required',
            validate: (value) => value?.trim() || 'Portfolio Name is required'
          })}
          error={errors.portfolioName?.message}
          placeholder="Enter portfolio name"
          required
        />
              </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Salesman"
            {...register('salesmanId', {
              required: 'Salesman is required'
            })}
            onChange={(value) => handleSelectChange('salesmanId', value)}
            options={salesmen}
            placeholder="Select salesman"
            error={errors.salesmanId?.message}
            required
          />
          <Select
            label="Customer"
            {...register('customerId', {
              required: 'Customer is required'
            })}
            onChange={(value) => handleSelectChange('customerId', value)}
            options={customers}
            placeholder="Select customer"
            error={errors.customerId?.message}
            required
          />
        </div>

        <Input
          label="Target Revenue"
          type="number"
          {...register('targetRevenue', {
            required: 'Target Revenue is required',
            valueAsNumber: true,
            min: { value: 0, message: 'Target revenue must be 0 or greater' }
          })}
          placeholder="Enter target revenue"
          min="0"
          step="0.01"
          error={errors.targetRevenue?.message}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            {...register('startDate', {
              required: 'Start Date is required'
            })}
            error={errors.startDate?.message}
            required
          />
          <Input
            label="End Date"
            type="date"
            {...register('endDate', {
              required: 'End Date is required'
            })}
            error={errors.endDate?.message}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            Items {errors.items && <span className="text-red-500 ml-1">*</span>}
          </label>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <Select
                value={currentItem.itemId}
                onChange={(value) => setCurrentItem((prev) => ({ ...prev, itemId: value }))}
                options={items.filter(item => !watchedItems?.some(i => i.itemId === item.value))}
                placeholder="Select item"
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                value={currentItem.targetQuantity.toString()}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, targetQuantity: parseFloat(e.target.value) || 0 }))}
                placeholder="Qty"
                min="0"
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                value={currentItem.targetValue.toString()}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                placeholder="Value"
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-1">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full h-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {errors.items && (
            <p className="text-sm text-red-500">{errors.items}</p>
          )}

          {fields.length > 0 && (
            <div className="mt-3 border border-[var(--border-color)] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Item
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Target Quantity
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Target Value
                    </th>
                    <th className="px-3 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {fields.map((field, index) => {
                    const itemOption = items.find(i => i.value === field.itemId);
                    return (
                      <tr key={field.id} className="bg-[var(--bg-card)]">
                        <td className="px-3 py-2 text-sm text-[var(--text-primary)]">
                          {itemOption?.label || field.itemId}
                        </td>
                        <td className="px-3 py-2 text-sm text-[var(--text-primary)]">
                          {field.targetQuantity}
                        </td>
                        <td className="px-3 py-2 text-sm text-[var(--text-primary)]">
                          ${field.targetValue.toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Input
          label="Notes"
          {...register('notes')}
          placeholder="Enter notes"
          error={errors.notes?.message}
        />

        <Select
          label="Status"
          {...register('status', {
            required: 'Status is required'
          })}
          onChange={(value) => handleSelectChange('status', value)}
          options={statusOptions}
          placeholder="Select status"
          error={errors.status?.message}
          required
        />

        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}

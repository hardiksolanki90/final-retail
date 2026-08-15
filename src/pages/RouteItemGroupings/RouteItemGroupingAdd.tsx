import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { RouteItemGroupingFormData } from '../../types/RouteItemGrouping';
import { X } from 'lucide-react';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface RouteItemGroupingAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
  onEvent?: (data: any) => void;
}

export function RouteItemGroupingAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: RouteItemGroupingAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;
  const routes = data?.routes || [];
  const items = data?.items || [];
  
  const defaultValues: RouteItemGroupingFormData = {
    routeId: '',
    groupName: '',
    description: '',
    priority: 1,
    effectiveDate: '',
    expiryDate: '',
    itemIds: [],
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
    clearErrors
  } = useForm<RouteItemGroupingFormData>({
    defaultValues,
    mode: 'onBlur'
  });

  const watchedItemIds = watch('itemIds') || [];
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (initialData && isOpen) {
      reset(initialData);
      setSelectedItems(initialData.itemIds || []);
    } else if (isOpen && !initialData) {
      reset(defaultValues);
      setSelectedItems([]);
    }
  }, [initialData, isOpen, reset]);

  // Sync selected items with watched itemIds
  useEffect(() => {
    setSelectedItems(watchedItemIds);
  }, [watchedItemIds]);

  const handleSelectChange = (field: keyof RouteItemGroupingFormData, value: string) => {
    setValue(field, value);
    clearErrors(field);
  };

  const handleAddItem = (itemId: string) => {
    if (itemId && !selectedItems.includes(itemId)) {
      const newItems = [...selectedItems, itemId];
      setSelectedItems(newItems);
      setValue('itemIds', newItems);
      clearErrors('itemIds');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = selectedItems.filter((id) => id !== itemId);
    setSelectedItems(newItems);
    setValue('itemIds', newItems);
    clearErrors('itemIds');
  };


  const onFormSubmit = async (data: RouteItemGroupingFormData) => {
    try {
      // Validate that at least one item is added
      if (!data.itemIds || data.itemIds.length === 0) {
        setError('itemIds', { type: 'required', message: 'At least one item is required' });
        return;
      }
      
      onEvent?.({
        eventType: initialData ? 'RouteItemGroupingUpdated' : 'RouteItemGroupingCreated',
        routeItemGrouping: data,
      });
    } catch (error: any) {
      console.error('Error saving route item grouping:', error);
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setError(field as keyof RouteItemGroupingFormData, { 
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
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Route Item Grouping' : 'Add Route Item Grouping'}
      width="w-[700px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <Select
          label="Route"
          {...register('routeId', {
            required: 'Route is required'
          })}
          onChange={(value) => handleSelectChange('routeId', value)}
          options={routes}
          placeholder="Select route"
          error={errors.routeId?.message}
          required
        />

        <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group Name</label>
                  <OrderCodeSettingsIcon label="Group Name" value="" onChange={() => {}} />
                </div>
                <Input
          label="Group Name"
          {...register('groupName', {
            required: 'Group Name is required',
            validate: (value) => value?.trim() || 'Group Name is required'
          })}
          error={errors.groupName?.message}
          placeholder="Enter group name"
          required
        />
              </div>

        <Input
          label="Description"
          {...register('description')}
          placeholder="Enter description"
          error={errors.description?.message}
        />

        <Input
          label="Priority"
          type="number"
          {...register('priority', {
            required: 'Priority is required',
            valueAsNumber: true,
            min: { value: 1, message: 'Priority must be 1 or greater' }
          })}
          placeholder="Enter priority"
          min="1"
          error={errors.priority?.message}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Effective Date"
            type="date"
            {...register('effectiveDate', {
              required: 'Effective Date is required'
            })}
            error={errors.effectiveDate?.message}
            required
          />
          <Input
            label="Expiry Date"
            type="date"
            {...register('expiryDate')}
            error={errors.expiryDate?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            Items {errors.itemIds && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex gap-2">
            <Select
              value=""
              onChange={(value) => handleAddItem(value)}
              options={items.filter(item => !selectedItems.includes(item.value))}
              placeholder="Select item to add"
              className="flex-1"
            />
          </div>
          {errors.itemIds && (
            <p className="text-sm text-red-500">{errors.itemIds}</p>
          )}

          {selectedItems.length > 0 && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto border border-[var(--border-color)] rounded-lg p-3">
              {selectedItems.map((itemId) => {
                const item = items.find(i => i.value === itemId);
                return (
                  <div
                    key={itemId}
                    className="flex items-center justify-between bg-[var(--bg-secondary)] px-3 py-2 rounded-md"
                  >
                    <span className="text-sm text-[var(--text-primary)]">
                      {item?.label || itemId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(itemId)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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

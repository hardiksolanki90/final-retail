import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { BeatFormData } from '../../types/Beat';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface BeatAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: BeatFormData) => void | Promise<void>;
  onEvent?: (data: any) => void;
  initialData?: BeatFormData;
  isLoading?: boolean;
  salesmen?: SelectOption[];
  areas?: SelectOption[];
  routes?: SelectOption[];
  outlets?: SelectOption[];
}

const initialFormData: BeatFormData = {
  name: '',
  salesmanId: 0,
  areaId: 0,
  routeId: 0,
  workingDays: [],
  selectedOutlets: [],
  description: '',
  status: true,
};

// Sample data for dropdowns
const defaultSalesmen: SelectOption[] = [
  { value: 1, label: 'John Smith (SM001)' },
  { value: 2, label: 'Sarah Johnson (SM002)' },
  { value: 3, label: 'Mike Davis (SM003)' },
  { value: 4, label: 'Lisa Wilson (SM004)' },
  { value: 5, label: 'Tom Brown (SM005)' },
];

const defaultAreas: SelectOption[] = [
  { value: 1, label: 'North Zone (NZ001)' },
  { value: 2, label: 'South Zone (SZ002)' },
  { value: 3, label: 'East Zone (EZ003)' },
  { value: 4, label: 'West Zone (WZ004)' },
  { value: 5, label: 'Central Zone (CZ005)' },
];

const defaultRoutes: SelectOption[] = [
  { value: 1, label: 'Route 001 (R001)' },
  { value: 2, label: 'Route 002 (R002)' },
  { value: 3, label: 'Route 003 (R003)' },
  { value: 4, label: 'Route 004 (R004)' },
  { value: 5, label: 'Route 005 (R005)' },
];

const defaultOutlets: SelectOption[] = [
  { value: 1, label: 'Metro Store Downtown (OUT001)' },
  { value: 2, label: 'SuperMart Plaza (OUT002)' },
  { value: 3, label: 'FreshMart South (OUT003)' },
  { value: 4, label: 'QuickStop East (OUT004)' },
  { value: 5, label: 'MegaMart West (OUT005)' },
];

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export function BeatAdd({
  isOpen,
  onClose,
  onSubmit,
  onEvent,
  initialData,
  isLoading = false,
  salesmen = [],
  areas = [],
  routes = [],
  outlets = [],
}: BeatAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
    setError
  } = useForm<BeatFormData>({
    defaultValues: initialFormData
  });

  const watchedAreaId = watch('areaId');
  const watchedRouteId = watch('routeId');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: BeatFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      if (onEvent) {
        onEvent({
          eventType: 'BeatSaved',
          beat: data
        });
      }
      onClose();
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'Error saving beat' 
      });
    }
  };

  const defaultSalesmenOptions: SelectOption[] = salesmen.length > 0 ? salesmen : defaultSalesmen;
  const defaultAreaOptions: SelectOption[] = areas.length > 0 ? areas : defaultAreas;
  const defaultRouteOptions: SelectOption[] = routes.length > 0 ? routes : defaultRoutes;
  const defaultOutletOptions: SelectOption[] = outlets.length > 0 ? outlets : defaultOutlets;

  const watchedStatus = watch('status');

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={isSubmitting}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="beat-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Beat' : 'Save Beat'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Beat' : 'Add Beat'}
      width="w-[700px]"
      footer={footerContent}
    >
      <form id="beat-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        {/* Beat Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beat Name *</label>
                  <OrderCodeSettingsIcon label="Beat Name *" value="" onChange={() => {}} />
          <input
            {...register('name', {
              required: 'Beat name is required',
              validate: value => value.trim() !== '' || 'Beat name cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter beat name"
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Salesman */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salesman *</label>
          <select
            {...register('salesmanId', {
              required: 'Salesman is required',
              valueAsNumber: true,
              validate: value => value > 0 || 'Please select a salesman'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="0">Select salesman</option>
            {defaultSalesmenOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.salesmanId && (
            <p className="text-red-600 text-xs mt-1">{errors.salesmanId.message}</p>
          )}
        </div>

        {/* Area, Route Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area *</label>
            <select
              {...register('areaId', {
                required: 'Area is required',
                valueAsNumber: true,
                validate: value => value > 0 || 'Please select an area'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="0">Select area</option>
              {defaultAreaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.areaId && (
              <p className="text-red-600 text-xs mt-1">{errors.areaId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route *</label>
            <select
              {...register('routeId', {
                required: 'Route is required',
                valueAsNumber: true,
                validate: value => value > 0 || 'Please select a route'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
              disabled={!watchedAreaId}
            >
              <option value="0">Select route</option>
              {defaultRouteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.routeId && (
              <p className="text-red-600 text-xs mt-1">{errors.routeId.message}</p>
            )}
          </div>
        </div>

        {/* Working Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Working Days *
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleWorkingDayToggle(day)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.workingDays.includes(day)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
          {errors.workingDays && <p className="mt-1 text-sm text-red-500">{errors.workingDays}</p>}
        </div>

        {/* Outlets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Outlets *
          </label>
          {!formData.routeId ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Please select a route first</p>
          ) : (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
              {defaultOutletOptions.map((outlet) => (
                <label
                  key={outlet.value}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedOutlets.includes(Number(outlet.value))}
                    onChange={() => handleOutletToggle(Number(outlet.value))}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">{outlet.label}</span>
                </label>
              ))}
            </div>
          )}
          {errors.selectedOutlets && <p className="mt-1 text-sm text-red-500">{errors.selectedOutlets}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Optional description for this beat"
          />
        </div>
      </form>
    </Drawer>
  );
}
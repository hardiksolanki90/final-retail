import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { Upload } from 'lucide-react';
import type {
  SalesmanFormData,
  Salesman,
} from '../../types/Salesman';
import { useSalesman } from '../../providers/SalesmanProvider';

interface SalesmanAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Salesman | null;
  onEvent?: (data: any) => void;
}

const initialFormData: SalesmanFormData = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  mobile: '',
  countryId: '',
  routeId: '',
  salesmanTypeId: '',
  salesmanRoleId: '',
  supervisorId: '',
  employeeCode: '',
  salesmanCode: '',
  profileImage: '',
  designation: '',
  joiningDate: '',
  status: true,
};

export function SalesmanAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: SalesmanAddProps) {
  const {
    addSalesman,
    updateSalesmanData,
    isAdding,
    isUpdating,
    routes,
    salesmanTypes,
    salesmanRoles,
    countries,
    supervisorOptions,
    isLoadingRelatedData,
  } = useSalesman();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue
  } = useForm<SalesmanFormData>({
    defaultValues: initialFormData
  });

  const isEditing = !!data;
  const watchedStatus = watch('status');


  useEffect(() => {
    if (isOpen && data) {
      reset({
        firstname: data.user?.firstname || '',
        lastname: data.user?.lastname || '',
        email: data.user?.email || '',
        mobile: data.user?.mobile || '',
        countryId: data.user?.countryId?.toString() || '',
        routeId: data.route?.id?.toString() || '',
        salesmanTypeId: data.salesmanType?.id?.toString() || '',
        salesmanRoleId: data.salesmanRole?.id?.toString() || '',
        supervisorId: data.supervisor?.id?.toString() || '',
        employeeCode: data.employeeCode || '',
        salesmanCode: data.salesmanCode || '',
        profileImage: data.profileImage || '',
        designation: data.designation || '',
        joiningDate: data.joiningDate || '',
        status: data.status || true,
      });
    } else if (isOpen) {
      reset(initialFormData);
    }
  }, [isOpen, data, reset]);

  const onFormSubmit = async (formData: SalesmanFormData) => {
    try {
      let result;
      
      if (isEditing && data?.uuid) {
        result = await updateSalesmanData(data.uuid, formData);
      } else {
        result = await addSalesman(formData);
      }

      onEvent?.({
        eventType: 'SalesmanSaved',
        salesman: result,
      });
      
      reset(initialFormData);
      onClose();
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'Failed to save salesman. Please try again.' 
      });
    }
  };

  const handleClose = () => {
    reset(initialFormData);
    onClose();
  };

  // Convert related data to SelectOptions
  const routeOptions: SelectOption[] = routes.map(route => ({
    value: route.id.toString(),
    label: route.routeName
  }));

  const salesmanTypeOptions: SelectOption[] = salesmanTypes.map(type => ({
    value: type.id.toString(),
    label: type.name
  }));

  const salesmanRoleOptions: SelectOption[] = salesmanRoles.map(role => ({
    value: role.id.toString(),
    label: role.name
  }));

  const countryOptions: SelectOption[] = countries.map(country => ({
    value: country.id.toString(),
    label: country.name
  }));

  const supervisorOptionsList: SelectOption[] = supervisorOptions.map(supervisor => ({
    value: supervisor.id.toString(),
    label: supervisor.name
  }));

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <button
          type="button"
          onClick={() => setValue('status', !watchedStatus)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            watchedStatus
              ? 'bg-primary-600 dark:bg-primary-500'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              watchedStatus ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${
          watchedStatus
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {watchedStatus ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="salesman-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Salesman' : 'Save Salesman'}
        </SaveButton>
      </div>
    </div>
  );


  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Salesman' : 'Add Salesman'}
      width="w-[800px]"
      footer={footerContent}
    >
      <form id="salesman-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.root.message}
          </div>
        )}

        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Code
              </label>
              <Input
                {...register('employeeCode')}
                placeholder="Auto-generated if empty"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salesman Code
              </label>
              <Input
                {...register('salesmanCode')}
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <Input
                {...register('firstname', { 
                  required: 'First name is required',
                  validate: value => value.trim() !== '' || 'First name cannot be empty'
                })}
                placeholder="Enter first name"
                error={errors.firstname?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <Input
                {...register('lastname')}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                type="email"
                placeholder="Enter email address"
                error={errors.email?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mobile Number
              </label>
              <Input
                {...register('mobile')}
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <Input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                placeholder="Enter password"
                error={errors.password?.message}
              />
            </div>
          )}
        </div>






        {/* Assignment Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Assignment Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salesman Type
              </label>
              <Select
                {...register('salesmanTypeId')}
                options={salesmanTypeOptions}
                placeholder="Select salesman type"
                loading={isLoadingRelatedData}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salesman Role
              </label>
              <Select
                {...register('salesmanRoleId')}
                options={salesmanRoleOptions}
                placeholder="Select salesman role"
                loading={isLoadingRelatedData}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Route
              </label>
              <Select
                {...register('routeId')}
                options={routeOptions}
                placeholder="Select route"
                loading={isLoadingRelatedData}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supervisor
              </label>
              <Select
                {...register('supervisorId')}
                options={supervisorOptionsList}
                placeholder="Select supervisor"
                loading={isLoadingRelatedData}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country
              </label>
              <Select
                {...register('countryId')}
                options={countryOptions}
                placeholder="Select country"
                loading={isLoadingRelatedData}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Designation
              </label>
              <Input
                {...register('designation')}
                placeholder="Enter designation"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Joining Date
            </label>
            <Input
              {...register('joiningDate')}
              type="date"
            />
          </div>
        </div>


        {/* Additional Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile Image URL
            </label>
            <Input
              {...register('profileImage')}
              placeholder="Enter profile image URL"
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Upload className="w-6 h-6 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Image Upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to upload or drag and drop your image here (Max 2MB)
              </p>
            </div>
          </div>
        </div>

      </form>
    </Drawer>
  );
}

export default SalesmanAdd;

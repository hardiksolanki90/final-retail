import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Drawer } from "../../components/ui/Drawer";
import { Input } from "../../components/ui/Input";
import { Select, type SelectOption } from "../../components/ui/Select";
import { SaveButton, CancelButton } from "../../components/ui/Button";
import type {
  CustomerFormData,
  Customer,
} from "../../types/Customer";
import { useCustomer } from "../../providers/CustomerProvider";

interface CustomerAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Customer | null;
  onEvent?: (data: any) => void;
}

const initialFormData: CustomerFormData = {
  code: "",
  erpCode: "",
  shopName: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zipcode: "",
  latitude: 0,
  longitude: 0,
  balance: 0,
  creditLimit: 0,
  creditDays: 30,
  trnNo: "",
  image: "",
  status: true,
  routeId: "",
  salesmanId: "",
  customerTypeId: "",
  customerCategoryId: "",
  customerGroupId: "",
  channelId: "",
  paymentTermId: "",
};

export function CustomerAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: CustomerAddProps) {
  const {
    addCustomer,
    updateCustomerData,
    isAdding,
    isUpdating,
    routes,
    customerTypes,
    customerCategories,
    customerGroups,
    channels,
    paymentTerms,
  } = useCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
  } = useForm<CustomerFormData>({
    defaultValues: initialFormData,
  });

  const isEditing = !!data;
  const watchedStatus = watch("status");

  useEffect(() => {
    if (isOpen && data) {
      reset({
        code: data.code || '',
        erpCode: data.erpCode || '',
        shopName: data.shopName || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipcode: data.zipcode || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        balance: data.balance || 0,
        creditLimit: data.creditLimit || 0,
        creditDays: data.creditDays || 30,
        trnNo: data.trnNo || '',
        image: data.image || '',
        status: data.status ?? true,
        routeId: data.route?.id?.toString() || '',
        salesmanId: data.salesman?.id?.toString() || '',
        customerTypeId: data.customerType?.id?.toString() || '',
        customerCategoryId: data.customerCategory?.id?.toString() || '',
        customerGroupId: data.customerGroup?.id?.toString() || '',
        channelId: data.channel?.id?.toString() || '',
        paymentTermId: data.paymentTerm?.id?.toString() || '',
      });
    } else if (isOpen) {
      reset(initialFormData);
    }
  }, [isOpen, data, reset]);

  const onFormSubmit = async (formData: CustomerFormData) => {
    try {
      let result;
      if (isEditing && data?.uuid) {
        result = await updateCustomerData(data.uuid, formData);
      } else {
        result = await addCustomer(formData);
      }
      onEvent?.({ eventType: 'CustomerSaved', customer: result });
      reset(initialFormData);
      onClose();
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Failed to save customer. Please try again.',
      });
    }
  };

  const handleClose = () => {
    reset(initialFormData);
    onClose();
  };

  // Map related data to SelectOptions
  const routeOptions: SelectOption[] = routes.map(route => ({
    value: route.id?.toString() || '',
    label: route.routeName || '',
  }));

  const customerTypeOptions: SelectOption[] = customerTypes.map(type => ({
    value: type.id?.toString() || '',
    label: type.name || '',
  }));

  const customerCategoryOptions: SelectOption[] = customerCategories.map(cat => ({
    value: cat.id?.toString() || '',
    label: cat.categoryName || '',
  }));

  const customerGroupOptions: SelectOption[] = customerGroups.map(group => ({
    value: group.id?.toString() || '',
    label: group.groupName || '',
  }));

  const channelOptions: SelectOption[] = channels.map(channel => ({
    value: channel.id?.toString() || '',
    label: channel.channelName || '',
  }));

  const paymentTermOptions: SelectOption[] = paymentTerms.map(term => ({
    value: term.id?.toString() || '',
    label: term.name || '',
  }));

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
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              watchedStatus ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${
          watchedStatus ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {watchedStatus ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={handleClose} disabled={isSubmitting || isAdding || isUpdating}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="customer-form" disabled={isSubmitting || isAdding || isUpdating}>
          {(isSubmitting || isAdding || isUpdating) ? 'Saving...' : isEditing ? 'Update Customer' : 'Save Customer'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Customer" : "Add Customer"}
      width="w-[800px]"
      footer={footerContent}
    >
      <form
        id="customer-form"
        onSubmit={handleSubmit(onFormSubmit)}
        className="p-6 space-y-4"
      >
        {/* Root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.root.message}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Code
              </label>
              <Input {...register('code')} placeholder="Auto-generated if empty" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ERP Code
              </label>
              <Input {...register('erpCode')} placeholder="Enter ERP code" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shop Name *
            </label>
            <Input
              {...register('shopName', {
                required: 'Shop name is required',
                validate: value => value.trim() !== '' || 'Shop name cannot be empty',
              })}
              placeholder="Enter shop name"
              error={errors.shopName?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <Input
                {...register('firstName', {
                  required: 'First name is required',
                  validate: value => value.trim() !== '' || 'First name cannot be empty',
                })}
                placeholder="Enter first name"
                error={errors.firstName?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <Input {...register('lastName')} placeholder="Enter last name" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                type="email"
                placeholder="Enter email address"
                error={errors.email?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <Input {...register('phoneNumber')} placeholder="Enter phone number" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Address</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address *
            </label>
            <Input
              {...register('address', { required: 'Address is required' })}
              placeholder="Enter address"
              error={errors.address?.message}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <Input {...register('city')} placeholder="Enter city" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <Input {...register('state')} placeholder="Enter state" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zipcode
              </label>
              <Input {...register('zipcode')} placeholder="Enter zipcode" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Latitude
              </label>
              <Input
                {...register('latitude', { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="0.000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Longitude
              </label>
              <Input
                {...register('longitude', { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="0.000000"
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Classification</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Type
              </label>
              <Select
                {...register('customerTypeId')}
                options={customerTypeOptions}
                placeholder="Select customer type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Category
              </label>
              <Select
                {...register('customerCategoryId')}
                options={customerCategoryOptions}
                placeholder="Select category"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Group
              </label>
              <Select
                {...register('customerGroupId')}
                options={customerGroupOptions}
                placeholder="Select group"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Channel
              </label>
              <Select
                {...register('channelId')}
                options={channelOptions}
                placeholder="Select channel"
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Term
              </label>
              <Select
                {...register('paymentTermId')}
                options={paymentTermOptions}
                placeholder="Select payment term"
              />
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Financial</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Balance
              </label>
              <Input
                {...register('balance', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credit Limit
              </label>
              <Input
                {...register('creditLimit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credit Days
              </label>
              <Input
                {...register('creditDays', { valueAsNumber: true })}
                type="number"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              TRN No
            </label>
            <Input {...register('trnNo')} placeholder="Enter TRN number" />
          </div>
        </div>
      </form>
    </Drawer>
  );
}

export default CustomerAdd;

import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronLeft } from 'lucide-react';
import { CancelButton, SaveButton } from '../../components/ui/Button';
import { updateOrganisation } from '../../api/OrganisationApi';
import { showToast } from '../../lib/toast';
import { useAuth } from '../../context/AuthContext';
import type { OrganisationFormData } from '../../types/Organisation';

const initialFormData: OrganisationFormData = {
  org_name: '',
  org_company_id: '',
  org_tax_id: '',
  org_street1: '',
  org_street2: '',
  org_city: '',
  org_state: '',
  org_country_id: '',
  org_postal: '',
  org_phone: '',
  org_contact_person: '',
  org_contact_person_number: '',
  org_currency: 'USD',
  org_fasical_year: '',
  is_batch_enabled: false,
  is_credit_limit_enabled: false,
  gstin_number: '',
  gst_reg_date: '',
};

export const OrganisationAdd: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<OrganisationFormData>({
    defaultValues: initialFormData
  });

  const onSubmit = async (data: OrganisationFormData) => {
    try {
      await updateOrganisation(data);
      await checkAuthStatus();
      showToast.success('Organisation profile saved');
      navigate('/dashboard');
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Failed to save organisation' });
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Complete Organisation Profile</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/organisation/view')}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.root.message}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Organisation Name *</label>
                <input
                  type="text"
                  {...register('org_name', { required: 'Organisation name is required' })}
                  className={inputClass}
                  placeholder="Enter organisation name"
                />
                {errors.org_name && <p className="mt-1 text-sm text-red-600">{errors.org_name.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Company ID *</label>
                <input
                  type="text"
                  {...register('org_company_id', { required: 'Company ID is required' })}
                  className={inputClass}
                  placeholder="Enter company ID"
                />
                {errors.org_company_id && <p className="mt-1 text-sm text-red-600">{errors.org_company_id.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Tax ID</label>
                <input
                  type="text"
                  {...register('org_tax_id')}
                  className={inputClass}
                  placeholder="Enter tax ID"
                />
              </div>

              <div>
                <label className={labelClass}>Currency</label>
                <select {...register('org_currency')} className={inputClass}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Fiscal Year</label>
                <input
                  type="text"
                  {...register('org_fasical_year')}
                  className={inputClass}
                  placeholder="e.g. Jan-Dec"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Contact & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Phone Number *</label>
                <input
                  type="text"
                  {...register('org_phone', { required: 'Phone number is required' })}
                  className={inputClass}
                  placeholder="Enter phone number"
                />
                {errors.org_phone && <p className="mt-1 text-sm text-red-600">{errors.org_phone.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Contact Person</label>
                <input
                  type="text"
                  {...register('org_contact_person')}
                  className={inputClass}
                  placeholder="Contact person name"
                />
              </div>

              <div>
                <label className={labelClass}>Contact Person Number</label>
                <input
                  type="text"
                  {...register('org_contact_person_number')}
                  className={inputClass}
                  placeholder="Contact person phone"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Street 1 *</label>
                <input
                  type="text"
                  {...register('org_street1', { required: 'Street is required' })}
                  className={inputClass}
                  placeholder="Street address line 1"
                />
                {errors.org_street1 && <p className="mt-1 text-sm text-red-600">{errors.org_street1.message}</p>}
              </div>

              <div className="md:col-span-1">
                <label className={labelClass}>Street 2</label>
                <input
                  type="text"
                  {...register('org_street2')}
                  className={inputClass}
                  placeholder="Street address line 2"
                />
              </div>

              <div>
                <label className={labelClass}>City</label>
                <input type="text" {...register('org_city')} className={inputClass} placeholder="City" />
              </div>

              <div>
                <label className={labelClass}>State/Province</label>
                <input type="text" {...register('org_state')} className={inputClass} placeholder="State" />
              </div>

              <div>
                <label className={labelClass}>Postal Code</label>
                <input type="text" {...register('org_postal')} className={inputClass} placeholder="ZIP/Postal code" />
              </div>

              <div>
                <label className={labelClass}>Country</label>
                {/* Normally a dropdown with ID */}
                <input type="text" {...register('org_country_id')} className={inputClass} placeholder="Country ID" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Tax & Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>GSTIN Number</label>
                <input type="text" {...register('gstin_number')} className={inputClass} placeholder="GST ID" />
              </div>

              <div>
                <label className={labelClass}>GST Reg Date</label>
                <input type="date" {...register('gst_reg_date')} className={inputClass} />
              </div>

              <div className="flex flex-col space-y-3 pt-6">
                <label className="flex items-center">
                  <input type="checkbox" {...register('is_batch_enabled')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable Batch Module</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" {...register('is_credit_limit_enabled')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable Credit Limit</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <CancelButton onClick={() => navigate('/organisation/view')}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save & Submit'}
          </SaveButton>
        </div>
      </form>
    </div>
  );
};

export default OrganisationAdd;

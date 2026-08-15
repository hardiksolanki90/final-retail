import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Edit, MapPin, Phone, Hash, DollarSign, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export const OrganisationView: React.FC = () => {
  const navigate = useNavigate();

  // Mock data representing the single organisation setup for this tenant
  const orgData = {
    org_name: 'Acme Retail Corp',
    org_company_id: 'COMP-12345',
    org_tax_id: 'TAX-987654321',
    org_street1: '123 Business Avenue',
    org_street2: 'Suite 400',
    org_city: 'Metropolis',
    org_state: 'NY',
    org_postal: '10001',
    org_country_id: 'US', // Would normally be resolved to a country name
    org_phone: '+1 (555) 123-4567',
    org_contact_person: 'Jane Doe',
    org_contact_person_number: '+1 (555) 987-6543',
    org_currency: 'USD',
    org_fiscal_year: 'Jan-Dec',
    is_batch_enabled: true,
    is_credit_limit_enabled: true,
    gstin_number: 'GST-12345ABC',
    gst_reg_date: '2023-01-15',
    is_auto_approval_set: false,
    org_status: true,
    is_trial_period: false,
  };

  const StatusIcon = ({ status }: { status: boolean }) => (
    status ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Organisation Overview</h2>
        </div>
        <button
          onClick={() => navigate('/settings/organisation/edit')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" /> Edit Details
        </button>
      </div>

      <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{orgData.org_name}</h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Hash className="w-4 h-4"/> {orgData.org_company_id}</span>
                <span className="flex items-center gap-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${orgData.org_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {orgData.org_status ? 'Active' : 'Inactive'}
                  </span>
                </span>
                {orgData.is_trial_period && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Trial Period
                  </span>
                )}
              </div>
            </div>
            {/* Logo placeholder */}
            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact & Location */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Contact & Location</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4"/> Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                  {orgData.org_street1} {orgData.org_street2 && `, ${orgData.org_street2}`}<br />
                  {orgData.org_city}, {orgData.org_state} {orgData.org_postal}<br />
                  {orgData.org_country_id}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4"/> Primary Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{orgData.org_phone}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  Contact Person
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                  {orgData.org_contact_person || 'N/A'} <br />
                  <span className="text-gray-500">{orgData.org_contact_person_number}</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Tax & Financials */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Financial Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Base Currency</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 font-medium flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-gray-400"/> {orgData.org_currency}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Fiscal Year</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400"/> {orgData.org_fiscal_year || 'N/A'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax ID</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{orgData.org_tax_id || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">GSTIN / Tax Reg No</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                  {orgData.gstin_number || 'N/A'}
                  {orgData.gst_reg_date && <span className="block text-xs text-gray-500">Reg: {orgData.gst_reg_date}</span>}
                </dd>
              </div>
            </dl>
          </div>

          {/* System Settings & Modules */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Modules & Settings</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Batch Module</span>
                <StatusIcon status={orgData.is_batch_enabled} />
              </li>
              <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Credit Limits</span>
                <StatusIcon status={orgData.is_credit_limit_enabled} />
              </li>
              <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Approval</span>
                <StatusIcon status={orgData.is_auto_approval_set} />
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrganisationView;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Building2,
  Edit,
  MapPin,
  Hash,
  Calendar,
  Check,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useOrganisation } from '../../hooks/Organisation/useOrganisation';

const labelClass = 'font-mono-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B0D0A]/50 dark:text-[#F5F3ED]/50';
const valueClass = 'font-mono-ui mt-1.5 text-sm text-[#0B0D0A] dark:text-[#F5F3ED]';
const mutedClass = 'italic text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40';
const sectionTitleClass = 'font-mono-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0B0D0A]/70 dark:text-[#F5F3ED]/70';
const panelClass = 'border-2 border-[#0B0D0A]/15 bg-[#F5F3ED] p-6 dark:border-[#F5F3ED]/20 dark:bg-[#0B0D0A]';
const primaryButtonClass =
  'group inline-flex items-center gap-2 border-2 border-[#0B0D0A] bg-[#0B0D0A] px-4 py-2.5 font-mono-ui text-xs font-semibold uppercase tracking-[0.15em] text-[#F5F3ED] shadow-[4px_4px_0_0_#FF5A1F] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#FF5A1F] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_0_#FF5A1F] dark:border-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#0B0D0A]';

export const OrganisationView: React.FC = () => {
  const navigate = useNavigate();
  const { organisation, isLoading, error, refetch } = useOrganisation();
  const errorMessage = (error as any)?.response?.data?.message || (error ? 'Failed to load organisation details' : null);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-spin border-2 border-[#0B0D0A]/15 border-t-[#FF5A1F] dark:border-[#F5F3ED]/15 dark:border-t-[#FF5A1F]" />
          <p className="font-mono-ui text-xs tracking-[0.2em] text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
            LOADING RECORD…
          </p>
        </div>
      </div>
    );
  }

  if (error || !organisation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md border-2 border-[#0B0D0A]/15 bg-[#F5F3ED] p-8 text-center dark:border-[#F5F3ED]/20 dark:bg-[#0B0D0A]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-[#FF5A1F] text-[#FF5A1F]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-display mt-4 text-xl font-bold text-[#0B0D0A] dark:text-[#F5F3ED]">
            Unable to load record
          </h3>
          <p className="font-mono-ui mt-2 text-xs text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
            {errorMessage || 'No organisation found.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 border-2 border-[#0B0D0A]/20 px-4 py-2.5 font-mono-ui text-xs font-semibold uppercase tracking-[0.15em] text-[#0B0D0A] transition-colors hover:border-[#0B0D0A]/40 dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED] dark:hover:border-[#F5F3ED]/40"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
            <button onClick={() => navigate('/organisation/add')} className={primaryButtonClass}>
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isProfileIncomplete = !organisation.is_complete;
  const taxProfile = organisation.country?.taxProfile;
  const address = [
    organisation.org_street1,
    organisation.org_street2,
    organisation.org_city,
    organisation.org_state,
    organisation.org_postal,
  ].filter(Boolean);
  const modules = [
    { label: 'Batch Tracking', enabled: organisation.is_batch_enabled },
    { label: 'Credit Limit', enabled: organisation.is_credit_limit_enabled },
    { label: 'Auto Approval', enabled: organisation.is_auto_approval_set },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      {/* Eyebrow / toolbar */}
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono-ui text-[10px] tracking-[0.25em] text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40">
          ORGANISATION / RECORD
        </span>
        <button onClick={() => navigate(`/organisation/edit/${organisation.uuid}`)} className={primaryButtonClass}>
          <Edit className="h-3.5 w-3.5" /> Edit Details
        </button>
      </div>

      {/* Incomplete notice */}
      {isProfileIncomplete && (
        <div className="flex items-start justify-between gap-4 border-2 border-[#FF5A1F] bg-[#FF5A1F]/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A1F]" />
            <div>
              <p className="font-mono-ui text-xs font-semibold uppercase tracking-[0.15em] text-[#0B0D0A] dark:text-[#F5F3ED]">
                Profile Incomplete
              </p>
              <p className="font-mono-ui mt-1 text-[11px] leading-relaxed text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
                Minimal details on file. Complete billing address, tax registration, and module preferences.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/organisation/add')}
            className="shrink-0 font-mono-ui text-[11px] font-semibold uppercase tracking-[0.1em] text-[#FF5A1F] hover:underline"
          >
            Complete →
          </button>
        </div>
      )}

      {/* Header / identity card */}
      <div className="relative overflow-hidden border-2 border-[#0B0D0A]/15 bg-[#F5F3ED] p-6 dark:border-[#F5F3ED]/20 dark:bg-[#0B0D0A] sm:p-8">
        <span className="font-mono-ui pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] font-medium leading-none text-[#0B0D0A]/[0.04] dark:text-[#F5F3ED]/[0.04]">
          {(organisation.org_company_id || '00').slice(-2).toUpperCase()}
        </span>
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-[#0B0D0A] dark:text-[#F5F3ED] sm:text-4xl">
              {organisation.org_name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 border-2 border-[#0B0D0A]/15 px-2.5 py-1 font-mono-ui text-[11px] text-[#0B0D0A]/70 dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED]/70">
                <Hash className="h-3 w-3" /> {organisation.org_company_id || 'ID PENDING'}
              </span>
              {organisation.is_trial_period && (
                <span className="border-2 border-dashed border-[#0B0D0A]/25 px-2.5 py-1 font-mono-ui text-[11px] uppercase tracking-[0.1em] text-[#0B0D0A]/60 dark:border-[#F5F3ED]/25 dark:text-[#F5F3ED]/60">
                  Trial Period
                </span>
              )}
            </div>
          </div>

          {/* Status stamp */}
          <div
            className={clsx(
              '-rotate-6 select-none px-4 py-2 font-mono-ui text-sm font-bold uppercase tracking-[0.2em]',
              organisation.org_status
                ? 'border-4 border-double border-[#FF5A1F] text-[#FF5A1F]'
                : 'border-4 border-double border-[#0B0D0A]/30 text-[#0B0D0A]/30 dark:border-[#F5F3ED]/30 dark:text-[#F5F3ED]/30'
            )}
          >
            {organisation.org_status ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Record sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact & Location */}
        <div className={panelClass}>
          <div className="mb-5 flex items-center gap-2 border-b-2 border-[#0B0D0A]/10 pb-3 dark:border-[#F5F3ED]/10">
            <MapPin className="h-4 w-4 text-[#FF5A1F]" />
            <h3 className={sectionTitleClass}>Contact &amp; Location</h3>
          </div>
          <dl className="space-y-4">
            <div>
              <dt className={labelClass}>Address</dt>
              <dd className={valueClass}>
                {address.length > 0 ? address.join(', ') : <span className={mutedClass}>No street address configured</span>}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Primary Phone</dt>
              <dd className={valueClass}>
                {organisation.org_phone || <span className={mutedClass}>Not provided</span>}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Contact Person</dt>
              <dd className={valueClass}>
                {organisation.org_contact_person || <span className={mutedClass}>N/A</span>}
                {organisation.org_contact_person_number && (
                  <span className="text-[#0B0D0A]/50 dark:text-[#F5F3ED]/50"> ({organisation.org_contact_person_number})</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Financial & Tax */}
        <div className={panelClass}>
          <div className="mb-5 flex items-center gap-2 border-b-2 border-[#0B0D0A]/10 pb-3 dark:border-[#F5F3ED]/10">
            <ShieldCheck className="h-4 w-4 text-[#FF5A1F]" />
            <h3 className={sectionTitleClass}>Financial &amp; Tax</h3>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className={labelClass}>Base Currency</dt>
              <dd className={clsx(valueClass, 'font-semibold')}>{organisation.org_currency || 'USD'}</dd>
            </div>
            <div>
              <dt className={labelClass}>Fiscal Year</dt>
              <dd className={clsx(valueClass, 'flex items-center gap-1.5')}>
                <Calendar className="h-3.5 w-3.5 text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40" />
                {organisation.org_fasical_year || <span className={mutedClass}>Not set</span>}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className={labelClass}>{taxProfile?.registrationNumberLabel || 'Tax Registration'}</dt>
              <dd className={valueClass}>
                {organisation.org_tax_id || <span className={mutedClass}>Not set</span>}
              </dd>
            </div>
          </dl>

          {taxProfile && (
            <div className="mt-5 border-t-2 border-[#0B0D0A]/10 pt-4 dark:border-[#F5F3ED]/10">
              <p className="font-mono-ui text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0B0D0A]/70 dark:text-[#F5F3ED]/70">
                {taxProfile.taxSystem} — {taxProfile.taxName}
              </p>
              {taxProfile.jurisdictionLevel.length > 0 && (
                <p className="font-mono-ui mt-1.5 text-[11px] text-[#0B0D0A]/50 dark:text-[#F5F3ED]/50">
                  Jurisdiction: {taxProfile.jurisdictionLevel.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modules & Settings */}
        <div className={clsx(panelClass, 'lg:col-span-2')}>
          <div className="mb-5 flex items-center gap-2 border-b-2 border-[#0B0D0A]/10 pb-3 dark:border-[#F5F3ED]/10">
            <Building2 className="h-4 w-4 text-[#FF5A1F]" />
            <h3 className={sectionTitleClass}>Modules &amp; Settings</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {modules.map((mod) => (
              <div
                key={mod.label}
                className={clsx(
                  'flex items-center justify-between border-2 p-4',
                  mod.enabled ? 'border-[#FF5A1F] shadow-[4px_4px_0_0_#FF5A1F]' : 'border-[#0B0D0A]/15 dark:border-[#F5F3ED]/15'
                )}
              >
                <span className="font-mono-ui text-xs font-semibold uppercase tracking-[0.1em] text-[#0B0D0A] dark:text-[#F5F3ED]">
                  {mod.label}
                </span>
                <span
                  className={clsx(
                    'flex h-5 w-5 shrink-0 items-center justify-center border-2',
                    mod.enabled ? 'border-[#FF5A1F] bg-[#FF5A1F] text-[#0B0D0A]' : 'border-[#0B0D0A]/20 dark:border-[#F5F3ED]/20'
                  )}
                >
                  {mod.enabled && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationView;

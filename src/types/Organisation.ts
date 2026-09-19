export interface Organisation {
  id?: number;
  uuid?: string;
  org_name: string;
  org_company_id?: string;
  org_tax_id?: string;
  org_street1?: string;
  org_street2?: string;
  org_city?: string;
  org_state?: string;
  org_country_id?: number;
  org_postal?: string;
  org_phone?: string;
  org_contact_person?: string;
  org_contact_person_number?: string;
  org_currency?: string;
  org_fasical_year?: string;
  is_batch_enabled?: boolean;
  is_credit_limit_enabled?: boolean;
  org_logo?: string;
  gstin_number?: string;
  gst_reg_date?: string;
  is_auto_approval_set?: boolean;
  org_status?: boolean;
  is_trial_period?: boolean;
  is_complete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  country?: {
    id: number;
    countryMasterId: number | null;
    name: string;
    countryCode: string;
    dialCode?: string | null;
    currency?: string | null;
    currencyCode?: string | null;
    currencySymbol?: string | null;
    taxProfile: {
      taxSystem: string;
      taxName: string;
      registrationNumberLabel: string | null;
      components: string[];
      jurisdictionLevel: string[];
      calculationNotes: string | null;
      taxStatus: string | null;
      defaultRate: string | number | null;
    } | null;
  } | null;
}

export interface OrganisationFormData {
  org_name: string;
  org_company_id: string;
  org_tax_id?: string;
  org_street1: string;
  org_street2?: string;
  org_city?: string;
  org_state?: string;
  country_master_id?: string;
  org_postal?: string;
  org_phone: string;
  org_contact_person?: string;
  org_contact_person_number?: string;
  org_currency?: string;
  org_fasical_year?: string;
  is_batch_enabled?: boolean;
  is_credit_limit_enabled?: boolean;
  gst_reg_date?: string;
}

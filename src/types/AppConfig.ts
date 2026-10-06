export interface ConfigCurrency {
  code: string;
  symbol: string | null;
  decimalDigits: number;
}

export interface ConfigUser {
  uuid: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile?: string | null;
  usertype: number;
}

export interface ConfigRole {
  name: string;
  permissions: string[];
}

export interface ConfigOrganisation {
  uuid: string;
  org_name: string;
  org_logo?: string | null;
  org_currency?: string;
  org_fasical_year?: string | null;
  is_batch_enabled?: boolean;
  is_credit_limit_enabled?: boolean;
  is_auto_approval_set?: boolean;
  is_trial_period?: boolean;
  org_status?: boolean;
  is_complete?: boolean;
  default_currency?: ConfigCurrency | null;
  country?: {
    name: string;
    countryCode: string;
    dialCode?: string | null;
    currency?: string | null;
    currencyCode?: string | null;
    currencySymbol?: string | null;
    taxProfile?: { taxSystem: string; taxName: string; registrationNumberLabel: string; defaultRate?: number | null } | null;
  } | null;
}

/** The organisation's main tax (from its country's profile and tax table). */
export interface ConfigTax {
  /** Tax type code, e.g. VAT / GST. */
  code: string;
  name: string;
  /** False for countries without automatic rates (US…): only item rates apply. India and Canada are supported — their rates follow the customer's state/province. */
  supported: boolean;
  /** Default tax-table rate in percent, or null when none is configured. */
  rate: number | null;
  country: string | null;
}

export interface AppConfig {
  version: number;
  generatedAt: string;
  user: ConfigUser;
  role: ConfigRole | null;
  organisation: ConfigOrganisation | null;
  tax: ConfigTax | null;
  currency: { organisation: string | null; default: ConfigCurrency | null; effective: ConfigCurrency | null };
}

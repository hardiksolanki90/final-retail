export interface CountryMaster {
  id: number;
  name: string;
  countryCode: string;
  dialCode?: string;
  currency?: string;
  currencyCode?: string;
  currencySymbol?: string;
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
}

export interface Country {
  id?: string;
  uuid?: string;
  countryMasterId?: number;
  code: string;
  name: string;
  countryCode?: string;
  currency?: string;
  currencyCode?: string;
  dialCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CountryFormData {
  countryMasterId: number | '';
  name: string;
  countryCode: string;
  dialCode: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  status?: boolean;
}

export interface CountryListResponse {
  data: Country[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

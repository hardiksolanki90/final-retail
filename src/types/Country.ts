export interface Country {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  currency?: string;
  phoneCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CountryFormData {
  code: string;
  name: string;
  currency?: string;
  phoneCode?: string;
}

export interface CountryListResponse {
  data: Country[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

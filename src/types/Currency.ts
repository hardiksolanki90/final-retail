export interface Currency {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  exchangeRate?: number;
}

export interface CurrencyListResponse {
  data: Currency[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

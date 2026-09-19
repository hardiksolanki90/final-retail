export type CurrencyFormat = '1,234,567.89' | '1.234.567.89' | '1 234 567.89';

export interface Currency {
  id?: number;
  uuid?: string;
  currencyMasterId?: number;
  name: string;
  symbol: string;
  code: string;
  namePlural: string;
  symbolNative: string;
  decimalDigits: number;
  rounding: number;
  defaultCurrency?: boolean;
  format?: CurrencyFormat;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrencyFormData {
  currencyMasterId: number | '';
  name: string;
  symbol: string;
  code: string;
  namePlural: string;
  symbolNative: string;
  decimalDigits: number | '';
  rounding: number | '';
  defaultCurrency?: boolean;
  format?: CurrencyFormat | '';
}

export interface CurrencyMasterOption {
  id: number;
  name: string;
  code: string;
  symbol: string;
  namePlural: string;
  symbolNative: string;
  decimalDigits: number;
  rounding: number;
}

export interface CurrencyListResponse {
  data: Currency[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

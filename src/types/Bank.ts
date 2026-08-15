export interface Bank {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  accountNumber: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankFormData {
  code: string;
  name: string;
  accountNumber: string;
  address: string;
}

export interface BankListResponse {
  data: Bank[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface Bank {
  id?: string;
  uuid?: string;
  bankCode: string;
  bankName: string;
  bankAddress: string;
  accountNumber: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankFormData {
  bankCode: string;
  bankName: string;
  bankAddress: string;
  accountNumber: string;
  status: string;
}

export interface BankListResponse {
  data: Bank[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

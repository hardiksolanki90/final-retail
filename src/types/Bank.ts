export interface Bank {
  id?: string;
  uuid?: string;
  bankCode: string;
  bankName: string;
  bankAddress: string;
  accountNumber: string;
  status: boolean;
  iban?: string | null;
  swiftCode?: string | null;
  ifscCode?: string | null;
  routingNumber?: string | null;
  sortCode?: string | null;
  branchName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankFormData {
  bankCode: string;
  bankName: string;
  bankAddress: string;
  accountNumber: string;
  status: boolean;
  iban?: string | null;
  swiftCode?: string | null;
  ifscCode?: string | null;
  routingNumber?: string | null;
  sortCode?: string | null;
  branchName?: string | null;
}

export interface BankListResponse {
  data: Bank[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

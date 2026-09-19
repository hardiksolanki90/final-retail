export const REASON_TYPE_OPTIONS = [
  'Non Service Reason',
  'Good Return Reason',
  'Bad Return Reason',
  'Debit Note Reason',
  'Visit Reason',
  'Receipt Reason',
  'Order',
  'Delivery',
  'CreditNote',
  'SalesmanLoad',
  'GoodReturnNote',
  'Order Process Reason',
  'Delivery Reason',
] as const;

export type ReasonTypeValue = (typeof REASON_TYPE_OPTIONS)[number];

export interface Reason {
  id?: string;
  uuid?: string;
  code?: string;
  name: string;
  type: ReasonTypeValue;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReasonFormData {
  code?: string;
  name: string;
  type: ReasonTypeValue | '';
  status: boolean;
}

export interface ReasonListResponse {
  data: Reason[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface CreditNoteItem {
  id: string;
  itemId: string;
  itemName: string;
  uom: string;
  reason: string;
  quantity: number;
  price: number;
  discount: number;
  vat: number;
  net: number;
  excise: number;
  total: number;
}

export interface CreditNote {
  id?: string;
  uuid?: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  customerId: string;
  invoiceId: string;
  reason: string;
  items: CreditNoteItem[];
  grossTotal: number;
  vat: number;
  excise: number;
  netTotal: number;
  discount: number;
  finalTotal: number;
  status?: 'draft' | 'approved' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditNoteFormData {
  creditNoteNumber: string;
  creditNoteDate: string;
  customerId: string;
  invoiceId: string;
  reason: string;
  items: CreditNoteItem[];
  grossTotal: number;
  vat: number;
  excise: number;
  netTotal: number;
  discount: number;
  finalTotal: number;
}

export interface CreditNoteListResponse {
  data: CreditNote[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

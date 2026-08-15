export interface DebitNoteItem {
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

export interface DebitNote {
  id?: string;
  uuid?: string;
  debitNoteNumber: string;
  debitNoteDate: string;
  customerId: string;
  invoiceId: string;
  reason: string;
  items: DebitNoteItem[];
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

export interface DebitNoteFormData {
  debitNoteNumber: string;
  debitNoteDate: string;
  customerId: string;
  invoiceId: string;
  reason: string;
  items: DebitNoteItem[];
  grossTotal: number;
  vat: number;
  excise: number;
  netTotal: number;
  discount: number;
  finalTotal: number;
}

export interface DebitNoteListResponse {
  data: DebitNote[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

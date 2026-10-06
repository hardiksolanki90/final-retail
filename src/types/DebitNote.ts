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

/** One row of GET /debit-note/list. */
export interface DebitNoteListRow {
  uuid: string;
  noteNo: string;
  invoiceNo: string | null;
  customer: string | null;
  date: string | null;
  amount: number;
  reason: string | null;
  status: boolean;
}

export interface DebitNoteListResponse {
  data: DebitNoteListRow[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

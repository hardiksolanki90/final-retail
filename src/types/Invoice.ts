export interface Invoice {
  id?: number;
  uuid?: string;
  invoiceNumber: string;
  orderId: string;
  deliveryId?: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial';
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  terms?: string;
  createdAt?: string;
  updatedAt?: string;
  order?: {
    id?: number;
    uuid?: string;
    orderNumber: string;
  };
  customer?: {
    id?: number;
    uuid?: string;
    firstName: string;
    lastName: string;
    shopName?: string;
    customerCode: string;
  };
  invoiceItems?: InvoiceItem[];
}

export interface InvoiceItem {
  id?: number;
  uuid?: string;
  invoiceId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  totalAmount: number;
  item?: {
    id?: number;
    uuid?: string;
    name: string;
    itemCode: string;
  };
}

export interface InvoiceFormData {
  orderId: string;
  deliveryId?: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  invoiceItems: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
  }>;
}

export interface InvoiceListResponse {
  invoices?: Invoice[];
  data?: Invoice[];
  items?: Invoice[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  nextPage?: number;
  prevPage?: number;
}

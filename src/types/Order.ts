export interface Order {
  id?: number;
  uuid?: string;
  orderNumber: string;
  customerId: string;
  salesmanId?: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  notes?: string;
  shippingAddress?: string;
  billingAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: { id?: number; uuid?: string; firstName: string; lastName: string; shopName?: string; customerCode: string };
  salesman?: { id?: number; uuid?: string; firstName: string; lastName: string };
  orderDetails?: OrderDetail[];
}

export interface OrderDetail {
  id?: number;
  uuid?: string;
  orderId: string;
  itemId: string;
  itemUomId?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  totalAmount: number;
  item?: { id?: number; uuid?: string; name: string; itemCode: string };
  uom?: { id?: number; uuid?: string; name: string };
}

/** One line of an order payload — mirrors StoreOrderRequest's items.* rules. */
export interface OrderLinePayload {
  uuid?: string;
  itemId: string;
  itemUomId?: string;
  quantity: number;
  /** Ignored by the server when a Pricing plan matches — manual fallback only. */
  price?: number;
  /** Ignored by the server when a Discount plan matches — manual fallback only. */
  discount?: number;
  vat?: number;
  excise?: number;
  isFree?: boolean;
}

/** Order create/update payload — mirrors StoreOrderRequest. */
export interface OrderFormData {
  customerId: string;
  /** See constants/documentTypes. */
  orderTypeId?: number;
  salesmanId?: string;
  paymentTermId?: string;
  orderNumber?: string;
  orderDate?: string;
  deliveryDate?: string;
  dueDate?: string;
  notes?: string;
  items: OrderLinePayload[];
}

export interface OrderListResponse {
  orders?: Order[];
  data?: Order[];
  items?: Order[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  nextPage?: number;
  prevPage?: number;
}

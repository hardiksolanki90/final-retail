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
  customer?: { id?: number; uuid?: string; firstName: string; lastName: string; shopName?: string; name?: string; customerCode: string };
  /** List rows (GET …/list) also carry the document date and grand total. */
  date?: string | null;
  total?: number | null;
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

/** One line of GET /order/edit/{uuid} (OrderDetailResource). */
export interface OrderViewLine {
  uuid?: string;
  itemId: string;
  itemUomId?: string | null;
  /** Delivery lines: the reason; credit / debit note lines: the reason text. */
  reasonId?: string | null;
  reason?: string | null;
  itemName?: string | null;
  itemCode?: string | null;
  uomName?: string | null;
  quantity: number;
  price: number;
  discount: number;
  vat: number;
  excise: number;
  net: number;
  total: number;
  isFree: boolean;
  taxes: { code: string; name: string; rate: number | null; amount: number }[];
  /** Order lines: how much of the line is on deliveries, and how much is still left to deliver. */
  deliveredQty?: number;
  openQty?: number;
  /** Delivery lines converted from an order: that order line, how much was ordered, and the most this line can be. */
  orderLineUuid?: string | null;
  orderedQty?: number | null;
  maxQty?: number | null;
  /** Which pricing / discount / promotion plan priced this line (orders only). */
  pricingPlanName?: string | null;
  discountPlanName?: string | null;
  promotionPlanName?: string | null;
}

/** GET /order/edit/{uuid} (OrderView): one saved order with its names resolved. */
export interface OrderView {
  uuid: string;
  /** Still pending, so it can be edited (the update API enforces the same rule). */
  editable?: boolean;
  customerId?: string | null;
  salesmanId?: string | null;
  paymentTermId?: string | null;
  orderNumber: string;
  orderTypeId?: number | null;
  orderDate?: string | null;
  dueDate?: string | null;
  deliveryDate?: string | null;
  customerName?: string | null;
  customerCode?: string | null;
  salesmanName?: string | null;
  paymentTermName?: string | null;
  paymentTermDays?: number | null;
  routeId?: string | null;
  routeName?: string | null;
  warehouseId?: string | null;
  warehouseName?: string | null;
  depotName?: string | null;
  notes?: string | null;
  currentStage?: string | null;
  approvalStatus?: string | null;
  totalQty: number;
  totalGross: number;
  totalDiscountAmount: number;
  totalNet: number;
  totalVat: number;
  totalExcise: number;
  grandTotal: number;
  items: OrderViewLine[];
}

type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customerCode?: string;
  salesmanId?: string;
  salesmanName?: string;
  salesmanCode?: string;
  routeId?: string;
  routeName?: string;
  organisationId?: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
};

type OrderItem = {
  id: string;
  orderId: string;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  uomId?: string;
  uomName?: string;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  totalAmount: number;
};

type OrderListItem = {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  items: number;
  amount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Delivered' | 'Cancelled';
};

type OrderListResponse = {
  status: string;
  data: OrderListItem[];
  meta: PaginationMeta;
};

type OrderResponse = {
  status: string;
  data: Order;
};

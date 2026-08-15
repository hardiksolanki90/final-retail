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
  customer?: {
    id?: number;
    uuid?: string;
    firstName: string;
    lastName: string;
    shopName?: string;
    customerCode: string;
  };
  salesman?: {
    id?: number;
    uuid?: string;
    firstName: string;
    lastName: string;
  };
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
  item?: {
    id?: number;
    uuid?: string;
    name: string;
    itemCode: string;
  };
  uom?: {
    id?: number;
    uuid?: string;
    name: string;
  };
}

export interface OrderFormData {
  customerId: string;
  salesmanId?: string;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  shippingAddress?: string;
  billingAddress?: string;
  orderDetails: Array<{
    itemId: string;
    itemUomId?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
  }>;
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

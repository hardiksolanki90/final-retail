export interface Delivery {
  id?: number;
  uuid?: string;
  deliveryNumber: string;
  orderId: string;
  customerId: string;
  driverId?: string;
  vehicleId?: string;
  deliveryDate: string;
  scheduledDate?: string;
  actualDeliveryDate?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  deliveryAddress: string;
  deliveryNotes?: string;
  signature?: string;
  proof?: string;
  createdAt?: string;
  updatedAt?: string;
  order?: {
    id?: number;
    uuid?: string;
    orderNumber: string;
    totalAmount: number;
  };
  customer?: {
    id?: number;
    uuid?: string;
    firstName: string;
    lastName: string;
    shopName?: string;
  };
  driver?: {
    id?: number;
    uuid?: string;
    firstName: string;
    lastName: string;
  };
  deliveryItems?: DeliveryItem[];
}

export interface DeliveryItem {
  id?: number;
  uuid?: string;
  deliveryId: string;
  itemId: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  pendingQuantity: number;
  item?: {
    id?: number;
    uuid?: string;
    name: string;
    itemCode: string;
  };
}

export interface DeliveryFormData {
  orderId: string;
  customerId: string;
  driverId?: string;
  vehicleId?: string;
  deliveryDate: string;
  scheduledDate?: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  deliveryItems: Array<{
    itemId: string;
    orderedQuantity: number;
    deliveredQuantity: number;
  }>;
}

export interface DeliveryListResponse {
  deliveries?: Delivery[];
  data?: Delivery[];
  items?: Delivery[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  nextPage?: number;
  prevPage?: number;
}

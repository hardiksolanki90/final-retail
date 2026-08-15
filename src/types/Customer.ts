export interface Customer {
  id?: number;
  uuid?: string;
  code: string;
  erpCode?: string;
  shopName: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address: string;
  fullAddress?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  balance: number;
  creditLimit: number;
  creditDays?: number;
  availableCredit?: number;
  trnNo?: string;
  image?: string;
  status: boolean;
  routeId?: number;
  salesmanId?: number;
  customerTypeId?: number;
  customerCategoryId?: number;
  customerGroupId?: number;
  channelId?: number;
  paymentTermId?: number;
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  route?: {
    id: number;
    uuid: string;
    name: string;
  };
  salesman?: {
    id: number;
    name: string;
  };
  customerType?: {
    id: number;
    uuid: string;
    name: string;
  };
  customerCategory?: {
    id: number;
    uuid: string;
    name: string;
  };
  customerGroup?: {
    id: number;
    uuid: string;
    name: string;
  };
  channel?: {
    id: number;
    uuid: string;
    name: string;
  };
  paymentTerm?: {
    id: number;
    uuid: string;
    name: string;
    days: number;
  };
}

export interface CustomerFormData {
  code?: string;
  erpCode?: string;
  shopName: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  balance?: number;
  creditLimit?: number;
  creditDays?: number;
  trnNo?: string;
  image?: string;
  status?: boolean;
  routeId?: number | string;
  salesmanId?: number | string;
  customerTypeId?: number | string;
  customerCategoryId?: number | string;
  customerGroupId?: number | string;
  channelId?: number | string;
  paymentTermId?: number | string;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
    next_page_url?: string;
    prev_page_url?: string;
  };
  message: string;
}

export interface CustomerSalesData {
  salesData: Array<{
    date: string;
    totalValue: number;
    orderCount: number;
  }>;
  summary: {
    totalOrders: number;
    totalAmount: number;
    avgOrderValue: number;
  };
}

export interface CustomerType {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerCategory {
  id?: number;
  uuid?: string;
  categoryName: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerGroup {
  id?: number;
  uuid?: string;
  groupName: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Channel {
  id?: number;
  uuid?: string;
  channelName: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentTerm {
  id?: number;
  uuid?: string;
  name: string;
  numberOfDays: number;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Route {
  id?: number;
  uuid?: string;
  routeName: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFilters {
  search?: string;
  routeId?: number;
  salesmanId?: number;
  customerTypeId?: number;
  customerCategoryId?: number;
  channelId?: number;
  status?: boolean;
}

export interface CustomerBulkAction {
  action: 'activate' | 'deactivate' | 'delete';
  uuids: string[];
}

export interface CustomerSelectOption {
  value: string;
  label: string;
}

export interface User {
  id: number;
  uuid?: string;
  usertype: number;
  parentId?: number;
  firstname: string;
  lastname?: string;
  fullName?: string;
  username?: string;
  email: string;
  mobile?: string;
  countryId?: number;
  isApprovedByAdmin: boolean;
  status: boolean;
  loginType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Salesman {
  id: number;
  uuid: string;
  userId: number;
  employeeCode?: string;
  salesmanCode?: string;
  designation?: string;
  joiningDate?: string;
  profileImage?: string;
  status: boolean;
  isBlocked: boolean;
  blockStartDate?: string;
  blockEndDate?: string;
  canTakeOrders: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  user?: User;
  route?: {
    id: number;
    uuid: string;
    name: string;
    code?: string;
  };
  salesmanType?: {
    id: number;
    uuid: string;
    name: string;
  };
  salesmanRole?: {
    id: number;
    uuid: string;
    name: string;
  };
  supervisor?: {
    id: number;
    name: string;
  };
}

export interface SalesmanFormData {
  // User fields
  firstname: string;
  lastname?: string;
  email: string;
  password?: string;
  mobile?: string;
  countryId?: number | string;

  // Salesman info fields
  routeId?: number | string;
  salesmanTypeId?: number | string;
  salesmanRoleId?: number | string;
  supervisorId?: number | string;
  employeeCode?: string;
  salesmanCode?: string;
  profileImage?: string;
  designation?: string;
  joiningDate?: string;
  status?: boolean;
}

export interface SalesmanListResponse {
  data: Salesman[];
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

export interface SalesmanSalesData {
  salesData: Array<{
    date: string;
    totalValue: number;
    orderCount: number;
  }>;
  summary: {
    totalOrders: number;
    totalAmount: number;
    customerCount: number;
  };
}

export interface SalesmanLoginHistory {
  id: number;
  ip?: string;
  deviceName?: string;
  appVersion?: string;
  loginAt?: string;
  logoutAt?: string;
}

export interface SalesmanType {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesmanRole {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesmanFilters {
  search?: string;
  routeId?: number;
  salesmanTypeId?: number;
  salesmanRoleId?: number;
  supervisorId?: number;
  status?: boolean;
  isBlocked?: boolean;
}

export interface SalesmanBulkAction {
  action: 'activate' | 'deactivate' | 'delete' | 'block' | 'unblock';
  uuids: string[];
}

export interface SalesmanSelectOption {
  id: number;
  uuid: string;
  userId: number;
  salesmanCode?: string;
  name: string;
}

// Helper types for dropdowns and forms
export interface Country {
  id: number;
  uuid?: string;
  name: string;
  code?: string;
  status?: boolean;
}

export interface Route {
  id: number;
  uuid: string;
  routeName: string;
  routeCode?: string;
  description?: string;
  status: boolean;
}

export interface SupervisorOption {
  id: number;
  name: string;
  email?: string;
}

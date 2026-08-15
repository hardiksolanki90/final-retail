type Customer = {
  id: string;
  code: string;
  name: string;
  mobile: string;
  email?: string;
  category: string;
  channel: string;
  status: 'Active' | 'Inactive';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  regionId?: string;
  routeId?: string;
  salesmanId?: string;
  organisationId?: string;
  creditLimit?: number;
  outstandingBalance?: number;
  createdAt?: string;
  updatedAt?: string;
};

type CustomerListItem = {
  id: string;
  code: string;
  name: string;
  mobile: string;
  category: string;
  channel: string;
  status: 'Active' | 'Inactive';
};

type CustomerListResponse = {
  status: string;
  data: CustomerListItem[];
  meta: PaginationMeta;
};

type CustomerResponse = {
  status: string;
  data: Customer;
};

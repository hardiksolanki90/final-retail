type Salesman = {
  id: string;
  code: string;
  name: string;
  email?: string;
  mobile: string;
  status: 'Active' | 'Inactive';
  organisationId?: string;
  depotId?: string;
  depotName?: string;
  routeIds?: string[];
  routes?: Route[];
  address?: string;
  city?: string;
  state?: string;
  joiningDate?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
};

type SalesmanListItem = {
  id: string;
  code: string;
  name: string;
  mobile: string;
  route: string;
  depot: string;
  status: 'Active' | 'Inactive';
};

type SalesmanListResponse = {
  status: string;
  data: SalesmanListItem[];
  meta: PaginationMeta;
};

type SalesmanResponse = {
  status: string;
  data: Salesman;
};

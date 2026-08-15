type PaginationMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
};

type ApiResponse<T> = {
  status: 'success' | 'error';
  message?: string;
  data: T;
};

type ListResponse<T> = {
  status: string;
  data: T[];
  meta: PaginationMeta;
};

type SelectOption = {
  value: string;
  label: string;
};

type FilterParams = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: any;
};

type ExportParams = {
  type: 'all' | 'specific';
  fromDate?: string;
  toDate?: string;
  format: 'csv' | 'xls';
};

type BulkActionParams = {
  ids: string[];
  action: 'delete' | 'archive' | 'activate' | 'deactivate';
};

type Route = {
  id: string;
  code: string;
  name: string;
  areaId?: string;
  areaName?: string;
  status: 'Active' | 'Inactive';
};

type Region = {
  id: string;
  code: string;
  name: string;
  status: 'Active' | 'Inactive';
};

type Area = {
  id: string;
  code: string;
  name: string;
  regionId?: string;
  regionName?: string;
  status: 'Active' | 'Inactive';
};

type Depot = {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  status: 'Active' | 'Inactive';
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  status: 'Active' | 'Inactive';
};

type Organisation = {
  id: string;
  name: string;
  code?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: 'Active' | 'Inactive';
};

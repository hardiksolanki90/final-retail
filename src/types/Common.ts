// Pagination types
export interface PaginationData {
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  nextPage?: number;
  prevPage?: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

// Column search state for tables
export interface ColumnSearchState {
  isOpen: boolean;
  value: string;
}

export interface ColumnSearchStates {
  [key: string]: ColumnSearchState;
}

// Date range
export type DateRange = [string, string];

// Route/Navigation types
export interface Route {
  id?: number;
  uuid?: string;
  name: string;
  code?: string;
  description?: string;
  areaId?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  area?: Area;
}

export interface Area {
  id?: number;
  uuid?: string;
  name: string;
  code?: string;
  description?: string;
  regionId?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  region?: Region;
}

export interface Region {
  id?: number;
  uuid?: string;
  name: string;
  code?: string;
  description?: string;
  countryId?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Zone {
  id?: number;
  uuid?: string;
  name: string;
  code?: string;
  description?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id?: number;
  uuid?: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Organisation {
  id?: number;
  uuid?: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// User types
export interface User {
  id?: number;
  uuid?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive';
  roleId?: string;
  organisationId?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: Role;
}

export interface Role {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Journey Plan
export interface JourneyPlan {
  id?: number;
  uuid?: string;
  name: string;
  salesmanId: string;
  dayOfWeek: number;
  routeId?: string;
  customers?: string[];
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  salesman?: Salesman;
  route?: Route;
}

import type { Salesman } from './Salesman';

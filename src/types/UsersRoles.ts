export interface UserRole {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  permissions?: string[];
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRoleFormData {
  code: string;
  name: string;
  permissions?: string[];
  description?: string;
  status?: boolean;
}

export interface PermissionOption {
  value: string;
  label: string;
  module: string;
}

export interface UserRoleListResponse {
  data: UserRole[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface UserRole {
  id?: string;
  uuid?: string;
  code: string;
  name: string;
  permissions?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRoleFormData {
  code: string;
  name: string;
  permissions?: string[];
  description?: string;
}

export interface UserRoleListResponse {
  data: UserRole[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

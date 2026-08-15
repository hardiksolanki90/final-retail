type AuthUser = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  profileImage?: string;
  role: UserRole;
  permissions?: string[];
  organisationId?: string;
  organisationName?: string;
  status: 'Active' | 'Inactive';
  emailVerifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type UserRole = {
  id: string;
  name: string;
  permissions?: Permission[];
};

type Permission = {
  id: string;
  name: string;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';
};

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  mobile?: string;
  organisationId?: string;
};

type AuthResponse = {
  status: string;
  user: AuthUser;
  token: string;
  expiresAt?: string;
};

type PasswordResetRequest = {
  email: string;
};

type PasswordResetConfirm = {
  token: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

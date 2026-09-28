export interface InviteUserRoleRef {
  id: number;
  uuid: string;
  name: string;
}

export interface InviteUser {
  id: number;
  uuid: string;
  usertype: number;
  firstname: string;
  lastname: string | null;
  email: string;
  mobile: string | null;
  status: boolean;
  roleId: string | null;
  role: InviteUserRoleRef | null;
  invitedBy: number | null;
  createdAt: string | null;
}

export interface InviteUserFormData {
  firstname: string;
  lastname?: string;
  email: string;
  mobile?: string;
  roleId: string | number;
}

export interface InviteUserListResponse {
  data: InviteUser[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export type AdminUserRole = 'ADMIN' | 'USER';

export interface AdminUserSummary {
  id: string;
  email: string;
  role: AdminUserRole;
  createdAt: string;
  lastLoginAt: string | null;
  vipTitle: string | null;
}

export interface AdminUserListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  query: string | null;
  role: AdminUserRole | 'all';
  registeredFrom: string | null;
  registeredTo: string | null;
  vipEnabled?: boolean;
}

export interface AdminUserListResult {
  users: AdminUserSummary[];
  meta: AdminUserListMeta;
}

import { Metadata } from 'next';
import { listAdminUsers } from '@/lib/admin-users';
import UserManagementShell from './user-management-shell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '用户管理 - WAIMO Admin',
  description: '查看注册用户、关联询盘并执行批量删除、VIP 头衔维护等操作。',
  robots: 'noindex, nofollow',
};

export default async function AdminUsersPage() {
  const initialData = await listAdminUsers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-white">
      <div className="mb-8 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Admin Console</p>
        <h1 className="text-3xl font-semibold text-white">用户管理</h1>
        <p className="text-sm text-white/70">
          查看注册账号、关联 RFQ，支持多条件筛选、批量删除与 VIP 头衔维护，所有操作实时写入后端容器。
        </p>
      </div>

      <UserManagementShell initialData={initialData} />
    </div>
  );
}

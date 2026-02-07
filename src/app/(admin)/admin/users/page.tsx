import { Metadata } from 'next';
import { listAdminUsers } from '@/lib/admin-users';
import UserManagementShell from './user-management-shell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '用户管理 - WAIMO Admin',
  description: '查看注册用户、关联询盘并执行删除操作。',
  robots: 'noindex, nofollow',
};

export default async function AdminUsersPage() {
  const initialData = await listAdminUsers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Admin Console</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">用户管理</h1>
          <p className="text-sm text-gray-500 mt-2">
            一站式查看注册账号、关联询盘并支持多条件筛选、批量删除以及 VIP 头衔管理，所有操作实时写入数据库。
          </p>
        </div>
      </div>

      <UserManagementShell initialData={initialData} />
    </div>
  );
}

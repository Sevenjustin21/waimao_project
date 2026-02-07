'use client';

import { useState } from 'react';
import type { AdminUserListResult, AdminUserSummary } from '@/types/admin-users';
import type { Inquiry } from '@/lib/inquiries';
import Link from 'next/link';

type RoleFilter = 'all' | 'ADMIN' | 'USER';

interface Props {
  initialData: AdminUserListResult;
}

interface FlashMessage {
  type: 'success' | 'error';
  message: string;
}

interface UserDetailResponse {
  user: AdminUserSummary;
  inquiries: Inquiry[];
}

const statusStyles: Record<string, string> = {
  new: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

function formatDate(value: string | null) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function UserManagementShell({ initialData }: Props) {
  const [listData, setListData] = useState<AdminUserListResult>(initialData);
  const [queryInput, setQueryInput] = useState(initialData.meta.query ?? '');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(initialData.meta.role || 'all');
  const [registeredFrom, setRegisteredFrom] = useState(initialData.meta.registeredFrom ?? '');
  const [registeredTo, setRegisteredTo] = useState(initialData.meta.registeredTo ?? '');
  const [loadingList, setLoadingList] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const [vipInput, setVipInput] = useState('');
  const [vipSaving, setVipSaving] = useState(false);
  const vipEnabled = listData.meta.vipEnabled !== false;

  const totalUsers = listData.meta.total;

  async function fetchUsers(
    targetPage = 1,
    overrides: Partial<{ query: string; role: RoleFilter; registeredFrom: string; registeredTo: string }> = {},
  ) {
    setLoadingList(true);
    setFlash(null);

    try {
      const params = new URLSearchParams();
      params.set('page', targetPage.toString());

      const currentQuery = overrides.query !== undefined ? overrides.query : queryInput.trim();
      const currentRole = overrides.role ?? roleFilter;
      const currentFrom = overrides.registeredFrom !== undefined ? overrides.registeredFrom : registeredFrom;
      const currentTo = overrides.registeredTo !== undefined ? overrides.registeredTo : registeredTo;

      if (currentQuery) {
        params.set('q', currentQuery);
      }
      if (currentRole !== 'all') {
        params.set('role', currentRole);
      }
      if (currentFrom) {
        params.set('registeredFrom', currentFrom);
      }
      if (currentTo) {
        params.set('registeredTo', currentTo);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || '无法加载用户列表');
      }
      const data = payload as AdminUserListResult;

      setListData(data);
      setRoleFilter((data.meta.role || 'all') as RoleFilter);
      setQueryInput(data.meta.query ?? '');
      setRegisteredFrom(data.meta.registeredFrom ?? '');
      setRegisteredTo(data.meta.registeredTo ?? '');
      setSelectedUserId(null);
      setSelectedUser(null);
      setUserInquiries([]);
      setVipInput('');
    } catch (error) {
      setFlash({
        type: 'error',
        message: (error as Error).message || '加载失败，请稍后重试',
      });
    } finally {
      setLoadingList(false);
    }
  }

  async function loadUserDetail(userId: string) {
    setSelectedUserId(userId);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || '无法获取用户详情');
      }

      const data = payload as UserDetailResponse;
      setSelectedUser(data.user);
      setVipInput(data.user.vipTitle ?? '');
      setUserInquiries(data.inquiries || []);
    } catch (error) {
      setDetailError((error as Error).message || '加载详情失败');
      setSelectedUser(null);
      setUserInquiries([]);
      setVipInput('');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDelete(userId: string, role: string) {
    if (role === 'ADMIN') {
      setFlash({
        type: 'error',
        message: '禁止删除管理员账号',
      });
      return;
    }

    const target = listData.users.find((user) => user.id === userId);
    if (!target) return;

    const confirmed = window.confirm(
      `确认删除 ${target.email} 吗？该操作不可恢复，相关询盘不会被删除。`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || '删除失败');
      }

      setFlash({
        type: 'success',
        message: `已删除 ${target.email}`,
      });

      if (selectedUserId === userId) {
        setSelectedUserId(null);
        setSelectedUser(null);
        setUserInquiries([]);
      }

      await fetchUsers(listData.meta.page);
    } catch (error) {
      setFlash({
        type: 'error',
        message: (error as Error).message || '删除失败，请稍后重试',
      });
    }
  }

  async function handleVipSave(nextValue?: string) {
    if (!selectedUser) return;
    if (!vipEnabled) {
      setFlash({
        type: 'error',
        message: '当前数据库尚未启用 VIP 功能，请先运行数据库迁移。',
      });
      return;
    }
    setVipSaving(true);
    const payloadValue = nextValue !== undefined ? nextValue : vipInput;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vipTitle: payloadValue,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || '保存失败');
      }

      const updated = payload.user as AdminUserSummary;
      setSelectedUser(updated);
      setVipInput(updated.vipTitle ?? '');
      setListData((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === updated.id ? { ...user, vipTitle: updated.vipTitle } : user,
        ),
      }));
      setFlash({
        type: 'success',
        message: updated.vipTitle ? `已设为 VIP：${updated.vipTitle}` : '已取消 VIP 头衔',
      });
    } catch (error) {
      setFlash({
        type: 'error',
        message: (error as Error).message || '保存失败，请稍后再试',
      });
    } finally {
      setVipSaving(false);
    }
  }

  async function handleBulkDelete() {
    if (roleFilter === 'ADMIN') {
      setFlash({
        type: 'error',
        message: '请切换到普通用户后再执行批量删除',
      });
      return;
    }

    if (listData.meta.total === 0) {
      setFlash({
        type: 'error',
        message: '当前筛选结果为空，无法删除',
      });
      return;
    }

    const confirmed = window.confirm(
      `确认删除当前筛选出的 ${listData.meta.total} 个普通用户吗？该操作不可恢复。`,
    );
    if (!confirmed) return;

    setBulkDeleting(true);
    setFlash(null);

    try {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryInput.trim(),
          role: roleFilter,
          registeredFrom,
          registeredTo,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || '批量删除失败');
      }

      const deleted = payload.deleted ?? 0;
      setFlash({
        type: 'success',
        message: `已批量删除 ${deleted} 个普通用户账号`,
      });
      await fetchUsers(1, {
        query: queryInput.trim(),
        role: roleFilter,
        registeredFrom,
        registeredTo,
      });
    } catch (error) {
      setFlash({
        type: 'error',
        message: (error as Error).message || '批量删除失败，请稍后重试',
      });
    } finally {
      setBulkDeleting(false);
    }
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetchUsers(1, {
      query: queryInput.trim(),
      role: roleFilter,
      registeredFrom,
      registeredTo,
    });
  }

  function resetFilters() {
    setQueryInput('');
    setRoleFilter('all');
    setRegisteredFrom('');
    setRegisteredTo('');
    fetchUsers(1, { query: '', role: 'all', registeredFrom: '', registeredTo: '' });
  }

  function goToPage(direction: 'prev' | 'next') {
    if (direction === 'prev' && listData.meta.page > 1) {
      fetchUsers(listData.meta.page - 1);
    }
    if (direction === 'next' && listData.meta.page < listData.meta.totalPages) {
      fetchUsers(listData.meta.page + 1);
    }
  }

  return (
    <div className="space-y-6">
      {flash && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            flash.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {flash.message}
        </div>
      )}

      {!vipEnabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          当前数据库尚未包含 <code className="font-mono text-xs">vipTitle</code> 列，VIP 头衔功能已自动禁用。
          请在服务器执行 <code className="font-mono text-xs">npx prisma migrate deploy</code> 后刷新页面即可恢复完整能力。
        </div>
      )}

      <form
        onSubmit={handleSearch}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col md:flex-row gap-4 md:items-end"
      >
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            邮箱 / 关键字
          </label>
          <input
            type="text"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="输入完整邮箱或片段"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              注册日期（起）
            </label>
            <input
              type="date"
              value={registeredFrom}
              onChange={(event) => setRegisteredFrom(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              注册日期（止）
            </label>
            <input
              type="date"
              value={registeredTo}
              onChange={(event) => setRegisteredTo(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            角色
          </label>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            <option value="USER">普通用户</option>
            <option value="ADMIN">管理员</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            disabled={loadingList}
          >
            {loadingList ? '搜索中...' : '搜索'}
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            disabled={loadingList}
          >
            重置
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">账号列表</p>
              <p className="text-xs text-gray-500">共 {totalUsers} 个账号</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <div className="flex items-center gap-3">
                <span>
                  第 {listData.meta.page}/{listData.meta.totalPages} 页
                </span>
                <div className="inline-flex rounded-full border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => goToPage('prev')}
                    disabled={listData.meta.page === 1 || loadingList}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                  >
                    上一页
                  </button>
                  <span className="w-px bg-gray-200" aria-hidden />
                  <button
                    type="button"
                    onClick={() => goToPage('next')}
                    disabled={listData.meta.page === listData.meta.totalPages || loadingList}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                  >
                    下一页
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={
                  roleFilter === 'ADMIN' ||
                  totalUsers === 0 ||
                  loadingList ||
                  bulkDeleting
                }
                className="inline-flex items-center rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-300"
              >
                {bulkDeleting ? '删除中...' : '批量删除当前筛选'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">
                    用户
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">
                    最近登录
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listData.users.length > 0 ? (
                  listData.users.map((user) => (
                    <tr
                      key={user.id}
                      className={`cursor-pointer transition-colors ${
                        selectedUserId === user.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => loadUserDetail(user.id)}
                    >
                      <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-400 mt-1 truncate">ID: {user.id}</div>
                      {user.vipTitle && (
                        <span className="mt-1 inline-flex text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          VIP {user.vipTitle}
                        </span>
                      )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(user.lastLoginAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              loadUserDetail(user.id);
                            }}
                            className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            查看
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(user.id, user.role);
                            }}
                            disabled={user.role === 'ADMIN'}
                            className="inline-flex items-center rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-300"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">用户详情</h3>
              <p className="text-xs text-gray-500">
                展示用户基础信息以及最近 100 条询盘历史
              </p>
            </div>
            {detailLoading && (
              <span className="text-xs text-blue-600 font-medium animate-pulse">加载中...</span>
            )}
          </div>

          {!selectedUser && !detailLoading && (
            <p className="text-sm text-gray-500">
              点击左侧任意账号即可查看注册信息和关联询盘。
            </p>
          )}

          {detailError && (
            <p className="text-sm text-red-600 mb-3">
              {detailError}
            </p>
          )}

          {selectedUser && !detailLoading && (
            <>
              <dl className="divide-y divide-gray-100">
                <div className="py-3">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    邮箱
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 break-all">{selectedUser.email}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    注册时间
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    最近登录
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedUser.lastLoginAt)}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    角色
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.role === 'ADMIN' ? '管理员' : '普通用户'}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    VIP 头衔
                  </dt>
                  <dd className="mt-2 text-sm text-gray-900">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={vipInput}
                        onChange={(event) => setVipInput(event.target.value)}
                        maxLength={80}
                        disabled={!vipEnabled}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="输入 VIP 称谓，如“金牌客户”"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleVipSave()}
                          disabled={!vipEnabled || vipSaving}
                          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
                        >
                          {vipSaving ? '保存中...' : '保存'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVipSave('')}
                          disabled={
                            !vipEnabled ||
                            vipSaving ||
                            (!selectedUser.vipTitle && !vipInput)
                          }
                          className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:border-gray-200"
                        >
                          清除
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      留空并保存即可移除 VIP 头衔，普通用户登录后会在右上角看到自己的 VIP 标识。
                    </p>
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">询盘历史</h4>
                  <span className="text-xs text-gray-500">{userInquiries.length} 条记录</span>
                </div>

                {userInquiries.length === 0 ? (
                  <p className="text-sm text-gray-500">该用户暂无询盘。</p>
                ) : (
                  <div className="-mx-2 overflow-y-auto max-h-[380px] pr-2">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            日期
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            编号
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            状态
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            留言
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userInquiries.map((inquiry) => (
                          <tr key={inquiry.id}>
                            <td className="px-3 py-2 text-gray-600">
                              {formatDate(inquiry.date_created)}
                            </td>
                            <td className="px-3 py-2 text-gray-900">
                              <Link
                                href={`/admin/inquiries/${inquiry.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                #{inquiry.id}
                              </Link>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  statusStyles[inquiry.status] ||
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {inquiry.status?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-xs max-w-[220px] truncate">
                              {inquiry.message || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

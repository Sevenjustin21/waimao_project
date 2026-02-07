import 'server-only';
import type { Prisma, UserRole, AppUser } from '@prisma/client';
import type { AdminUserListResult, AdminUserSummary } from '@/types/admin-users';
import { prisma } from '@/lib/prisma';
import type { Inquiry } from '@/lib/inquiries';
import { getInquiries } from '@/lib/inquiries';
import { runWithVipColumn, isVipColumnEnabled } from '@/lib/vip-column';

export const DEFAULT_USER_PAGE_SIZE = 20;

type BaseUserFields = Pick<AppUser, 'id' | 'email' | 'role' | 'createdAt' | 'lastLoginAt'> & {
  vipTitle?: string | null;
};

export interface UserFilterOptions {
  query?: string;
  role?: UserRole | 'all';
  registeredFrom?: string | null;
  registeredTo?: string | null;
}

export interface ListUsersParams extends UserFilterOptions {
  page?: number;
  pageSize?: number;
}

interface NormalizedFilters {
  query: string | null;
  role: UserRole | 'all';
  registeredFrom: string | null;
  registeredTo: string | null;
}

export function toAdminUserSummary(user: BaseUserFields): AdminUserSummary {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    vipTitle: user.vipTitle ?? null,
  };
}

function parseDateInput(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date): Date {
  const cloned = new Date(date);
  cloned.setUTCHours(0, 0, 0, 0);
  return cloned;
}

function endOfDay(date: Date): Date {
  const cloned = new Date(date);
  cloned.setUTCHours(23, 59, 59, 999);
  return cloned;
}

function formatDateValue(date: Date | null, raw?: string | null) {
  if (!date) return null;
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  return date.toISOString().slice(0, 10);
}

export function buildUserFilters(
  params: UserFilterOptions = {},
): { where: Prisma.AppUserWhereInput; normalized: NormalizedFilters } {
  const where: Prisma.AppUserWhereInput = {};
  const trimmedQuery = params.query?.trim() || '';
  const queryValue = trimmedQuery || null;

  if (queryValue) {
    where.email = {
      contains: queryValue,
      mode: 'insensitive',
    };
  }

  let normalizedRole: UserRole | 'all' = 'all';
  if (params.role === 'ADMIN' || params.role === 'USER') {
    normalizedRole = params.role;
    where.role = params.role;
  }

  const fromDateRaw = parseDateInput(params.registeredFrom ?? null);
  const toDateRaw = parseDateInput(params.registeredTo ?? null);
  const fromDate = fromDateRaw ? startOfDay(fromDateRaw) : null;
  const toDate = toDateRaw ? endOfDay(toDateRaw) : null;

  if (fromDate || toDate) {
    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (fromDate) {
      createdAtFilter.gte = fromDate;
    }
    if (toDate) {
      createdAtFilter.lte = toDate;
    }
    where.createdAt = createdAtFilter;
  }

  return {
    where,
    normalized: {
      query: queryValue,
      role: normalizedRole,
      registeredFrom: formatDateValue(fromDateRaw, params.registeredFrom ?? null),
      registeredTo: formatDateValue(toDateRaw, params.registeredTo ?? null),
    },
  };
}

export async function listAdminUsers(params: ListUsersParams = {}): Promise<AdminUserListResult> {
  const page = Number.isFinite(params.page) ? Math.max(1, Math.floor(params.page!)) : 1;
  const pageSize = Number.isFinite(params.pageSize)
    ? Math.min(100, Math.max(1, Math.floor(params.pageSize!)))
    : DEFAULT_USER_PAGE_SIZE;
  const { where, normalized } = buildUserFilters(params);

  const selectShape: Prisma.AppUserSelect = {
    id: true,
    email: true,
    role: true,
    createdAt: true,
    lastLoginAt: true,
    vipTitle: true,
  };

  const [users, total] = await Promise.all([
    runWithVipColumn(async (includeVip) => {
      const select = { ...selectShape, vipTitle: includeVip };
      const records = await prisma.appUser.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select,
      });
      return (records as BaseUserFields[]).map((record) => ({
        ...record,
        vipTitle: includeVip ? record.vipTitle ?? null : null,
      }));
    }),
    prisma.appUser.count({ where }),
  ]);

  return {
    users: users.map(toAdminUserSummary),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      query: normalized.query,
      role: normalized.role,
      registeredFrom: normalized.registeredFrom,
      registeredTo: normalized.registeredTo,
      vipEnabled: isVipColumnEnabled(),
    },
  };
}

export async function getAdminUserDetail(userId: string, historyLimit = 100): Promise<{
  user: AdminUserSummary;
  inquiries: Inquiry[];
} | null> {
  if (!userId) {
    return null;
  }

  const userRecord = await runWithVipColumn(async (includeVip) => {
    const record = await prisma.appUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        vipTitle: includeVip,
      },
    });
    if (!record) return null;
    return {
      ...record,
      vipTitle: includeVip ? (record as BaseUserFields).vipTitle ?? null : null,
    } as BaseUserFields;
  });

  if (!userRecord) {
    return null;
  }

  const safeLimit = Math.min(500, Math.max(1, historyLimit));
  const inquiries = (await getInquiries(safeLimit, 'all', userId)) as unknown as Inquiry[];

  return {
    user: toAdminUserSummary(userRecord),
    inquiries,
  };
}

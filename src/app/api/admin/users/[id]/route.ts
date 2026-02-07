import { NextRequest, NextResponse } from "next/server";
import { getAdminUserDetail, toAdminUserSummary } from "@/lib/admin-users";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import type { AppUser } from "@prisma/client";
import { handleVipColumnWriteError, isVipColumnEnabled } from "@/lib/vip-column";
import { withSecurityContext } from "@/lib/security-context";

export const dynamic = "force-dynamic";

export const GET = withSecurityContext(async ({ params, context }) => {
  const userId = normalizeParam(params?.id);
  const session = context.session;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const detail = await getAdminUserDetail(userId);
  if (!detail) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
});

export const DELETE = withSecurityContext(async ({ params, context }) => {
  const userId = normalizeParam(params?.id);
  const session = context.session;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const target = await prisma.appUser.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === UserRole.ADMIN) {
    return NextResponse.json({ error: "禁止删除管理员账号" }, { status: 400 });
  }

  if (target.id === session.user.id) {
    return NextResponse.json({ error: "不能删除当前登录账号" }, { status: 400 });
  }

  await prisma.appUser.delete({
    where: { id: userId },
  });

  return NextResponse.json({ ok: true, deletedUserId: userId });
});

export const PATCH = withSecurityContext(async ({ req, params, context }) => {
  const userId = normalizeParam(params?.id);
  const session = context.session;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  if (!isVipColumnEnabled()) {
    return NextResponse.json(
      { error: "当前数据库尚未启用 VIP 功能，请执行 `npx prisma migrate deploy` 后重试。" },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const vipValue =
    typeof body.vipTitle === "string" ? body.vipTitle.trim().slice(0, 80) : "";
  const vipTitle = vipValue.length > 0 ? vipValue : null;

  const target = await prisma.appUser.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let updated: AppUser & { vipTitle?: string | null };
  try {
    updated = (await prisma.appUser.update({
      where: { id: userId },
      data: {
        vipTitle,
      },
    })) as AppUser & { vipTitle?: string | null };
  } catch (error) {
    if (handleVipColumnWriteError(error)) {
      return NextResponse.json(
        { error: "当前数据库未包含 vipTitle 列，请运行数据库迁移后再设置 VIP 头衔。" },
        { status: 400 },
      );
    }
    throw error;
  }
  return NextResponse.json({ user: toAdminUserSummary(updated) });
});

function normalizeParam(value?: string | string[]): string | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

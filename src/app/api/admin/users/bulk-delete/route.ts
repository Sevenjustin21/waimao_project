import { NextResponse } from "next/server";
import { buildUserFilters } from "@/lib/admin-users";
import { prisma } from "@/lib/prisma";
import { withSecurityContext } from "@/lib/security-context";

export const dynamic = "force-dynamic";

const MAX_BULK_DELETE = 500;

export const POST = withSecurityContext(async ({ req, context }) => {
  const session = context.session;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query : undefined;
  let role = (body.role || "all").toString().toUpperCase();
  const registeredFrom = typeof body.registeredFrom === "string" ? body.registeredFrom : undefined;
  const registeredTo = typeof body.registeredTo === "string" ? body.registeredTo : undefined;

  if (role === "ADMIN") {
    return NextResponse.json({ error: "批量删除仅支持普通用户" }, { status: 400 });
  }

  role = "USER";

  const { where } = buildUserFilters({
    query,
    role: role === "ADMIN" || role === "USER" ? (role as "ADMIN" | "USER") : "all",
    registeredFrom,
    registeredTo,
  });

  const total = await prisma.appUser.count({ where });
  if (total === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  if (total > MAX_BULK_DELETE) {
    return NextResponse.json(
      { error: `匹配到 ${total} 条账号，超出单次操作上限 ${MAX_BULK_DELETE}，请缩小筛选范围` },
      { status: 400 },
    );
  }

  await prisma.appUser.deleteMany({ where });

  return NextResponse.json({ deleted: total });
});

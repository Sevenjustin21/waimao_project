import { NextRequest, NextResponse } from "next/server";
import { listAdminUsers } from "@/lib/admin-users";
import { withSecurityContext } from "@/lib/security-context";

export const dynamic = "force-dynamic";

export const GET = withSecurityContext(async ({ req, context }) => {
  const session = context.session;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "", 10);
  const query = url.searchParams.get("q") || undefined;
  const roleParam = (url.searchParams.get("role") || "all").toUpperCase();
  const role = roleParam === "ADMIN" || roleParam === "USER" ? (roleParam as "ADMIN" | "USER") : "all";
  const registeredFrom = url.searchParams.get("registeredFrom") || undefined;
  const registeredTo = url.searchParams.get("registeredTo") || undefined;

  const data = await listAdminUsers({
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : undefined,
    query,
    role,
    registeredFrom,
    registeredTo,
  });

  return NextResponse.json(data);
});

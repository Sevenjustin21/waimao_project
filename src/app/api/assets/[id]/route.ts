import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DIRECTUS_BASE = (process.env.DIRECTUS_URL || "http://localhost:8055").replace(/\/$/, "");

function buildDirectusAssetUrl(id: string, req: NextRequest) {
  const target = new URL(`${DIRECTUS_BASE}/assets/${id}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return target.toString();
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = process.env.DIRECTUS_ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Directus admin token missing" }, { status: 500 });
  }

  const upstreamUrl = buildDirectusAssetUrl(params.id, req);

  const upstream = await fetch(upstreamUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!upstream.ok || !upstream.body) {
    const message = await upstream.text().catch(() => upstream.statusText);
    return NextResponse.json(
      { error: "Failed to fetch asset", message },
      { status: upstream.status || 502 },
    );
  }

  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.delete("content-security-policy");
  headers.delete("content-security-policy-report-only");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

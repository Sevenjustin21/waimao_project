import { NextResponse } from "next/server";
import { withSecurityContext } from "@/lib/security-context";

export const dynamic = 'force-dynamic';

export const POST = withSecurityContext(async ({ req, context }) => {
  const session = context.session;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    
    // Forward to Directus
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    const token = process.env.DIRECTUS_ADMIN_TOKEN;

    if (!token) {
        throw new Error("Directus Admin Token not configured");
    }

    const res = await fetch(`${directusUrl}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Note: Do NOT set Content-Type header when sending FormData with fetch,
        // it will set the boundary automatically.
      },
      body: formData,
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Directus Upload Failed: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

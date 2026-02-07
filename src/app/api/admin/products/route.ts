import { NextResponse } from "next/server";
import { directus } from "@/lib/directus";
import { syncProduct } from "@/lib/meilisearch";
import { createItem, readItems } from "@directus/sdk";
import { replaceProductGallery } from "@/lib/product-gallery";
import { withSecurityContext } from "@/lib/security-context";

export const dynamic = 'force-dynamic';

export const GET = withSecurityContext(async ({ context }) => {
  const session = context.session;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // @ts-ignore
    const products = await directus.request(readItems('products', {
      fields: ['*', 'image_id.*'] as any,
      sort: ['-date_created'],
    }));
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withSecurityContext(async ({ req, context }) => {
  const session = context.session;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const gallery = Array.isArray(body.gallery) ? body.gallery.filter((id: any) => typeof id === 'string' && id.length > 0) : [];
    const payload = { ...body };
    delete (payload as any).gallery;
    if (!payload.image_id && gallery[0]) {
      payload.image_id = gallery[0];
    }
    // Basic validation
    if (!body.name || !body.slug) {
        return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
    }

    const newProduct = await directus.request(createItem('products', payload));
    
    // Trigger Meilisearch sync
    try {
      await syncProduct(newProduct.id);
    } catch (syncError) {
      console.error("Failed to sync new product to Meilisearch:", syncError);
      // We don't fail the request if sync fails, but we log it.
    }

    await replaceProductGallery(newProduct.id, gallery);

    return NextResponse.json(newProduct);
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

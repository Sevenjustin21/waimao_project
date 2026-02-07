import { NextResponse } from "next/server";
import { directus } from "@/lib/directus";
import { syncProduct, deleteProductIndex } from "@/lib/meilisearch";
import { replaceProductGallery, deleteProductGallery } from "@/lib/product-gallery";
import { readItem, updateItem, deleteItem } from "@directus/sdk";
import { withSecurityContext } from "@/lib/security-context";

export const dynamic = 'force-dynamic';

export const GET = withSecurityContext(async ({ params, context }) => {
  const productId = normalizeParam(params?.id);
  const session = context.session;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    const product = await directus.request(readItem('products', productId, {
      fields: ['*', 'category_id.id', 'category_id.name', 'image_id.*'] as any,
    }));
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const PUT = withSecurityContext(async ({ req, params, context }) => {
  const productId = normalizeParam(params?.id);
  const session = context.session;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const gallery = Array.isArray(body.gallery) ? body.gallery.filter((id: any) => typeof id === 'string' && id.length > 0) : [];
    const payload = { ...body };
    delete (payload as any).gallery;
    if (!payload.image_id && gallery[0]) {
      payload.image_id = gallery[0];
    } else if (payload.image_id === null && gallery.length === 0) {
      payload.image_id = null;
    }

    const updatedProduct = await directus.request(updateItem('products', productId, payload));

    // Trigger Meilisearch sync
    try {
      await syncProduct(productId);
    } catch (syncError) {
      console.error("Failed to sync updated product to Meilisearch:", syncError);
    }

    await replaceProductGallery(productId, gallery);

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const DELETE = withSecurityContext(async ({ params, context }) => {
  const productId = normalizeParam(params?.id);
  const session = context.session;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    await directus.request(deleteItem('products', productId));

    // Trigger Meilisearch delete
    try {
      await deleteProductIndex(productId);
    } catch (syncError) {
      console.error("Failed to delete product from Meilisearch:", syncError);
    }

    await deleteProductGallery(productId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

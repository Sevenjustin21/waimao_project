import Link from "next/link";
import Image from "next/image";
import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { getGalleryMap } from "@/lib/product-gallery";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  let products: any[] = [];
  try {
    products = await directus.request(readItems('products', {
      fields: ['*', 'category_id.*'] as any,
      sort: ['-date_created'],
    }));
  } catch (error) {
    console.error("Failed to fetch products", error);
  }

  const assetBase = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || '/api/assets').replace(/\/$/, '');
  const galleryMap = await getGalleryMap(products.map((p) => p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
        >
          Add Product
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30">
        <ul className="divide-y divide-white/10">
          {products.map((product: any) => {
            const gallery = galleryMap[product.id] || [];
            const heroId =
              gallery[0]?.fileId ||
              (typeof product.image_id === 'object' ? product.image_id?.id : product.image_id) ||
              null;
            const heroUrl = heroId ? `${assetBase}/${heroId}` : null;

            return (
            <li key={product.id}>
              <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/5">
                    {heroUrl ? (
                      <Image
                        src={heroUrl}
                        alt={`${product.name} preview`}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xs text-white/60">No Img</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{product.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/60">
                      <span>SKU: {product.sku}</span>
                      <span>·</span>
                      <span>{product.category_id?.name || 'Uncategorized'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      product.status === 'published'
                        ? 'bg-emerald-400/20 text-emerald-100'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {product.status}
                  </span>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm font-semibold text-blue-200 hover:text-white"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </li>
          )})}
          {products.length === 0 && (
            <li className="px-4 py-8 text-center text-white/60">No products found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

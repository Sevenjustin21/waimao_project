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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {products.map((product: any) => {
            const gallery = galleryMap[product.id] || [];
            const heroId =
              gallery[0]?.fileId ||
              (typeof product.image_id === 'object' ? product.image_id?.id : product.image_id) ||
              null;
            const heroUrl = heroId ? `${assetBase}/${heroId}` : null;

            return (
            <li key={product.id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex items-center">
                  <div className="relative flex-shrink-0 h-14 w-14 bg-gray-100 rounded overflow-hidden border border-gray-200 flex items-center justify-center">
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
                      <span className="text-xs text-gray-400">No Img</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-blue-600 truncate">
                      {product.name}
                    </div>
                    <div className="flex text-sm text-gray-500 gap-2">
                        <span>SKU: {product.sku}</span>
                        <span>|</span>
                        <span>{product.category_id?.name || 'Uncategorized'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Edit
                  </Link>
                  {/* Delete button could be here, but usually inside Edit or separate action */}
                </div>
              </div>
            </li>
          )})}
          {products.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
                No products found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

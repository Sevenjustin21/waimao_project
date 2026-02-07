import ProductForm from "@/components/admin/product-form";
import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  let categories: any[] = [];
  let attributes: any[] = [];

  try {
    categories = await directus.request(readItems('categories', {
      fields: ['id', 'name', 'slug'],
      filter: { status: { _eq: 'published' } } as any,
      sort: ['name'],
      limit: -1,
    }));
    attributes = await directus.request(readItems('attributes', {
        fields: ['id', 'key', 'type'],
        filter: { status: { _eq: 'published' } } as any,
        sort: ['key'],
        limit: -1,
    }));
  } catch (error) {
    console.error("Failed to fetch dependencies", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Product</h1>
      <ProductForm categories={categories} attributes={attributes} />
    </div>
  );
}

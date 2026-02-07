import ProductForm from "@/components/admin/product-form";
import { directus } from "@/lib/directus";
import { readItem, readItems } from "@directus/sdk";
import DeleteProductButton from "./delete-button"; // We'll create this
import { getProductGallery } from "@/lib/product-gallery";

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  let product: any = null;
  let categories: any[] = [];
  let attributes: any[] = [];
  let initialGallery: string[] = [];

  try {
    product = await directus.request(readItem('products', params.id, {
      fields: ['*', 'category_id.*', 'image_id.*'] as any, // Expand if needed
    }));
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
    const galleryRecords = await getProductGallery(params.id);
    if (galleryRecords.length > 0) {
      initialGallery = galleryRecords.map((record) => record.fileId);
    } else {
      const primaryId = typeof (product as any)?.image_id === 'object'
        ? (product as any)?.image_id?.id
        : (product as any)?.image_id;
      if (primaryId) {
        initialGallery = [primaryId];
      }
    }
  } catch (error) {
    console.error("Failed to fetch data", error);
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <DeleteProductButton id={product.id} />
      </div>
      <ProductForm
        initialData={product}
        categories={categories}
        attributes={attributes}
        initialGallery={initialGallery}
      />
    </div>
  );
}

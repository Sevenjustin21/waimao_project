import { MetadataRoute } from 'next';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

async function getAllCategories() {
  try {
    const items = await directus.request(
      readItems('categories', {
        filter: { status: { _eq: 'published' } },
        fields: ['slug', 'date_updated'],
        limit: -1,
      })
    );
    return (items as any[]) || [];
  } catch (error) {
    console.error('Fetch categories for sitemap error:', error);
    return [];
  }
}

async function getAllProducts() {
  try {
    const items = await directus.request(
      readItems('products', {
        filter: { status: { _eq: 'published' } },
        fields: ['slug', 'date_updated'],
        limit: -1,
      })
    );
    return (items as any[]) || [];
  } catch (error) {
    console.error('Fetch products for sitemap error:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://waimo.export';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic category routes
  const categories = await getAllCategories();
  const categoryRoutes = categories.map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(category.date_updated),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic product routes
  const products = await getAllProducts();
  const productRoutes = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.date_updated),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

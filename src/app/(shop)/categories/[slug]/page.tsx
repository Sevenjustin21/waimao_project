import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import Link from 'next/link';
import ProductCard from '@/app/(shop)/products/components/product-card';
import { searchProducts } from '@/lib/meilisearch';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface Props {
  params: {
    slug: string;
  };
}

async function getCategoryBySlug(slug: string) {
  try {
    const items = await directus.request(
      readItems('categories', {
        filter: { 
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        fields: ['id', 'name', 'slug', 'description', 'parent_id'] as any,
        limit: 1
      })
    );
    
    return (items as any[])[0] || null;
  } catch (error) {
    console.error('Fetch category error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
    };
  }

  const description = category.description
    ? category.description.substring(0, 160)
    : `Browse our ${category.name} products and get instant quotes.`;

  return {
    title: `${category.name} | WAIMO Industrial Products`,
    description,
    openGraph: {
      title: `${category.name} - WAIMO`,
      description,
      type: 'website',
      url: `https://waimo.export/categories/${category.slug}`,
    },
    alternates: {
      canonical: `https://waimo.export/categories/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  // Fetch products in this category with pagination
  let products: any[] = [];
  let totalProducts = 0;
  let searchError = null;

  try {
    const searchResult = await searchProducts({
      category: category.slug,
      pageSize: 12,
      page: 1,
    });
    products = searchResult.hits || [];
    totalProducts = searchResult.total || 0;
  } catch (error) {
    console.error('Search products error:', error);
    searchError = 'Could not load products for this category';
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="mb-4 flex text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-gray-700">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-gray-600">{category.description}</p>
            )}
            <p className="text-sm text-gray-500">
              {totalProducts} product{totalProducts !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Banner */}
        {searchError && (
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">{searchError}</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-6 text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
              <p className="mt-2 text-sm text-gray-500">
                This category doesn&apos;t have any products yet. Please check back later or explore other categories.
              </p>
            </div>
            <div>
              <Link
                href="/products"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View All Products
              </Link>
            </div>
          </div>
        )}

        {/* Related Categories Suggestion */}
        <div className="mt-16 rounded-lg border border-gray-200 bg-white p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Need help?</h2>
          <p className="mb-6 text-gray-600">
            Can&apos;t find what you&apos;re looking for? Check our other categories or contact our sales team for personalized assistance.
          </p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse All Categories
          </Link>
        </div>
      </div>
    </div>
  );
}

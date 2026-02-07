import { Metadata } from 'next';
import { searchProducts } from '@/lib/meilisearch';
import SearchBar from './components/search-bar';
import FacetsSidebar from './components/facets-sidebar';
import ProductCard from './components/product-card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface ProductsPageProps {
  searchParams: {
    q?: string;
    page?: string;
    category?: string;
    filters?: string;
  };
}

export const metadata: Metadata = {
  title: 'Industrial Products - Buy Online | WAIMO',
  description: 'Browse our comprehensive catalog of industrial fasteners, components, and parts. Get instant quotes with fast export logistics.',
  keywords: ['industrial products', 'fasteners', 'components', 'parts', 'buy online', 'export'],
  openGraph: {
    title: 'Industrial Products - WAIMO',
    description: 'Explore quality industrial products with competitive pricing and export-ready logistics.',
    type: 'website',
    url: 'https://waimo.export/products',
  },
  alternates: {
    canonical: 'https://waimo.export/products',
  },
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;

  const result = await searchProducts({
    q: searchParams.q,
    page,
    pageSize,
    category: searchParams.category,
    filters: searchParams.filters,
  });

  // Parse filters for display
  let activeFilters: Record<string, string[]> = {};
  try {
    if (searchParams.filters) {
      activeFilters = JSON.parse(searchParams.filters);
    }
  } catch (e) {}

  const hasActiveFilters = searchParams.q || searchParams.category || Object.keys(activeFilters).length > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">Industrial Fasteners</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3 mb-4">
            Industrial Fasteners Catalog
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mb-8">
            Browse our extensive inventory of high-quality DIN, ISO, and ANSI standard fasteners. 
            Direct from manufacturer with full traceability.
          </p>
          <div className="max-w-2xl">
             <SearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  {hasActiveFilters && (
                    <Link 
                      href="/products"
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </Link>
                  )}
                </div>
                <FacetsSidebar facets={result.facets} />
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap gap-2 items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-500 font-semibold mr-2">Active Filters</span>
                
                {searchParams.q && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    Search: {searchParams.q}
                  </span>
                )}

                {searchParams.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Category: {searchParams.category}
                  </span>
                )}

                {Object.entries(activeFilters).map(([key, values]) => (
                  values.map(val => (
                     <span key={`${key}-${val}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                       {key.replace('attr_', '').toUpperCase()}: {val}
                     </span>
                  ))
                ))}

                {hasActiveFilters && (
                  <Link
                    href="/products"
                    className="ml-auto inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Clear All
                  </Link>
                )}
              </div>
            )}

            <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {result.total} Products Found
              </h2>
              <span className="text-sm text-gray-500">Page {page} of {result.totalPages}</span>
            </div>

            {result.hits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.hits.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                <div className="mt-6">
                  <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700">
                    Clear all filters
                  </Link>
                </div>
              </div>
            )}

            {result.totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {page > 1 && (
                   <Link
                     href={`/products?${new URLSearchParams({...searchParams, page: (page - 1).toString()} as any).toString()}`}
                     className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                   >
                     Previous
                   </Link>
                )}
                <span className="px-4 py-2 border border-blue-600 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold">
                  {page}
                </span>
                {page < result.totalPages && (
                   <Link
                     href={`/products?${new URLSearchParams({...searchParams, page: (page + 1).toString()} as any).toString()}`}
                     className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                   >
                     Next
                   </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

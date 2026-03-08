import { Metadata } from 'next';
import Link from 'next/link';
import { searchProducts } from '@/lib/meilisearch';
import SearchBar from './components/search-bar';
import FacetsSidebar from './components/facets-sidebar';
import ProductCard from './components/product-card';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

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
  description:
    'Browse our comprehensive catalog of industrial fasteners, components, and parts. Get instant quotes with fast export logistics.',
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
  const page = Number.parseInt(searchParams.page || '1', 10);
  const pageSize = 20;

  let result: Awaited<ReturnType<typeof searchProducts>> = {
    hits: [],
    page,
    pageSize,
    total: 0,
    totalPages: 0,
    facets: {},
  };
  let searchError: string | null = null;

  try {
    result = await searchProducts({
      q: searchParams.q,
      page,
      pageSize,
      category: searchParams.category,
      filters: searchParams.filters,
    });
  } catch (error: any) {
    console.error('searchProducts failed', error);
    searchError = 'Unable to reach search index. Please retry or contact operations to inspect Meilisearch.';
  }

  let activeFilters: Record<string, string[]> = {};
  try {
    if (searchParams.filters) {
      activeFilters = JSON.parse(searchParams.filters);
    }
  } catch {
    activeFilters = {};
  }

  const hasActiveFilters =
    Boolean(searchParams.q) || Boolean(searchParams.category) || Object.keys(activeFilters).length > 0;

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_55%)]">
      <div className="border-b border-white/5 bg-gradient-to-r from-[#020617] via-[#030712] to-[#050b17] py-14 text-white shadow-[0_25px_90px_rgba(0,0,0,0.65)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Engineering Terminal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Fastener Intelligence Console
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/70 sm:text-lg">
            Query our DIN / ISO / ANSI catalogue, visualize stock-ready assemblies, and push RFQ packets
            to our supply response team with full traceability and compliance metadata.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBar />
          </div>
        </div>
      </div>

 	    <div className="pointer-events-none fixed inset-0 z-0 opacity-10">
        <div className="grid-overlay h-full w-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full rounded-3xl border border-white/10 bg-[rgba(2,6,23,0.65)] p-6 backdrop-blur lg:w-72">
            <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-white">
              <span>Filters</span>
              {hasActiveFilters && (
                <Link href="/products" className="text-xs text-blue-300 hover:text-white">
                  Clear
                </Link>
              )}
            </div>
            <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
              <FacetsSidebar facets={result.facets} />
            </div>
          </aside>

          <div className="hidden w-px bg-gradient-to-b from-transparent via-white/15 to-transparent lg:block" />

          <main className="flex-1">
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-xs uppercase tracking-wide text-white">
                <span className="text-blue-200">Active Filters</span>

                {searchParams.q && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-blue-200">
                    Search:
                    <span className="font-mono text-white">{searchParams.q}</span>
                  </span>
                )}

                {searchParams.category && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-emerald-200">
                    Category:
                    <span className="font-mono text-white">{searchParams.category}</span>
                  </span>
                )}

                {Object.entries(activeFilters).flatMap(([key, values]) =>
                  values.map((val) => (
                    <span
                      key={`${key}-${val}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-white"
                    >
                      {key.replace('attr_', '').toUpperCase()}:
                      <span className="font-mono">{val}</span>
                    </span>
                  )),
                )}

                <Link
                  href="/products"
                  className="ml-auto inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-[color:var(--color-text-muted)] hover:text-white"
                >
                  Clear All
                </Link>
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">
                {result.total} SKUs indexed · Page {page}/{result.totalPages || 1}
              </h2>
              <span className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                DIN / ISO / ANSI · Live stock snapshots
              </span>
            </div>

            {searchError ? (
              <div className="rounded-3xl border border-dashed border-red-500/40 bg-red-500/10 px-6 py-6 text-sm text-red-100">
                {searchError}
              </div>
            ) : result.hits.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {result.hits.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-20 text-center text-white">
                <span className="mb-4 text-4xl">⌁</span>
                <p className="text-lg font-semibold">No matching components found</p>
                <p className="mt-2 text-[color:var(--color-text-muted)]">
                  Adjust diameter, material, standard or search terms to restore results。
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm uppercase tracking-wide text-white hover:border-blue-400"
                >
                  Reset Filters
                </Link>
              </div>
            )}

            {result.totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-3">
                {page > 1 && (
                  <Link
                    href={`/products?${new URLSearchParams({ ...searchParams, page: String(page - 1) } as any).toString()}`}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-blue-400"
                  >
                    Previous
                  </Link>
                )}
                <span className="rounded-full border border-blue-400/50 px-4 py-2 text-sm font-semibold text-blue-200">
                  {page}
                </span>
                {page < result.totalPages && (
                  <Link
                    href={`/products?${new URLSearchParams({ ...searchParams, page: String(page + 1) } as any).toString()}`}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-blue-400"
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

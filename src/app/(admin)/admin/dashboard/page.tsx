import { Metadata } from 'next';
import Link from 'next/link';
import { searchProducts } from '@/lib/meilisearch';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import ReindexButton from './components/dashboard-reindex';
import HealthCard from './components/health-card';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'WAIMO Admin Dashboard',
  description: 'System health and operations overview.',
};

async function getStats() {
  let productCount = 0;
  let productsError = false;
  try {
    const res = await searchProducts({ pageSize: 1 });
    productCount = res.total;
  } catch (error) {
    console.error('Failed to get product count', error);
    productsError = true;
  }

  let inquiryCount = 0;
  let inquiriesError = false;
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const inquiries = await directus.request(
      readItems('inquiries', {
        filter: { date_created: { _gte: yesterday } } as any,
        fields: ['id'],
        limit: 1000,
      }),
    );
    inquiryCount = inquiries.length;
  } catch (error) {
    console.error('Failed to get inquiry count', error);
    inquiriesError = true;
  }

  return { productCount, inquiryCount, productsError, inquiriesError };
}

export default async function DashboardPage() {
  const { productCount, inquiryCount, productsError, inquiriesError } = await getStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white">
      {(productsError || inquiriesError) && (
        <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100">
          <p className="text-sm">
            ⚠️ <strong>Backend Services Unavailable</strong> — ensure Docker services are running (
            <code className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-50">docker compose up -d</code>)
          </p>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Operations Overview</p>
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">System Dashboard</h1>
          <p className="mt-2 text-white/70">Monitor catalog scale, inquiry flow, and key services.</p>
        </div>
        <Link
          href="/products"
          target="_blank"
          className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
        >
          View Live Site
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/products" className="block">
          <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
            <dt className="text-xs uppercase tracking-[0.4em] text-white/60">Products</dt>
            <dd className="mt-3 text-3xl font-semibold text-white">
              {productsError ? '--' : productCount.toLocaleString()}
            </dd>
            <p className="mt-2 text-sm text-white/70">
              {productsError ? 'Backend unavailable' : 'Indexed SKUs ready for quote.'}
            </p>
          </div>
        </Link>

        <Link href="/admin/inquiries" className="block">
          <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
            <dt className="text-xs uppercase tracking-[0.4em] text-white/60">Inquiries (24h)</dt>
            <dd className="mt-3 text-3xl font-semibold text-white">
              {inquiriesError ? '--' : inquiryCount.toLocaleString()}
            </dd>
            <p className="mt-2 text-sm text-white/70">
              {inquiriesError ? 'Backend unavailable' : 'Latest RFQ activity window.'}
            </p>
          </div>
        </Link>

        <HealthCard service="Meilisearch" />
        <HealthCard service="Directus" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            <p className="text-sm text-white/70">Maintain search freshness and uptime.</p>
          </div>
        </div>
        <div className="mt-6 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Search Index</h3>
              <p className="text-sm text-white/70">Rebuild the Meilisearch index from Directus data.</p>
            </div>
            <ReindexButton />
          </div>
        </div>
      </div>
    </div>
  );
}


import { Metadata } from 'next';
import Link from 'next/link';
import { searchProducts } from '@/lib/meilisearch';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import ReindexButton from './components/dashboard-reindex';
import HealthCard from './components/health-card';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'WAIMO Admin Dashboard',
  description: 'System health and operations overview.',
};

async function getStats() {
  // 1. Products Count
  let productCount = 0;
  let productsError = false;
  try {
    const res = await searchProducts({ pageSize: 1 });
    productCount = res.total;
  } catch (e) {
    console.error('Failed to get product count', e);
    productsError = true;
  }

  // 2. Inquiries (Last 24h)
  let inquiryCount = 0;
  let inquiriesError = false;
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const inquiries = await directus.request(readItems('inquiries', {
      filter: { date_created: { _gte: yesterday } } as any,
      fields: ['id'],
      limit: 1000
    }));
    inquiryCount = inquiries.length;
  } catch (e) {
    console.error('Failed to get inquiry count', e);
    inquiriesError = true;
  }

  return { productCount, inquiryCount, productsError, inquiriesError };
}

export default async function DashboardPage() {
  const { productCount, inquiryCount, productsError, inquiriesError } = await getStats();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {(productsError || inquiriesError) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Backend Services Unavailable</strong> - Some features are disabled. 
            Please ensure Docker services are running: <code className="text-xs bg-yellow-100 px-2 py-1 rounded">docker compose up -d</code>
          </p>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Operations Overview</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">System Dashboard</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Monitor catalog scale, inquiry flow, and system health in real time.
          </p>
        </div>
        <Link
          href="/products"
          target="_blank"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Live Site
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Link href="/products" className="block group">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow h-full">
            <div className="px-6 py-7">
              <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide group-hover:text-blue-600">Products</dt>
              <dd className="mt-3 text-3xl font-semibold text-gray-900">{productsError ? '—' : productCount}</dd>
              <p className="mt-2 text-sm text-gray-500">{productsError ? 'Backend unavailable' : 'Indexed SKUs ready for quote.'}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/inquiries" className="block group">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow h-full">
            <div className="px-6 py-7">
              <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide group-hover:text-blue-600">Inquiries (24h)</dt>
              <dd className="mt-3 text-3xl font-semibold text-gray-900">{inquiriesError ? '—' : inquiryCount}</dd>
              <p className="mt-2 text-sm text-gray-500">{inquiriesError ? 'Backend unavailable' : 'Latest RFQ activity window.'}</p>
            </div>
          </div>
        </Link>

        <HealthCard service="Meilisearch" />
        <HealthCard service="Directus" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500 mt-1">Maintain search freshness and system uptime.</p>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Search Index</h3>
              <p className="text-sm text-gray-500 mt-1">Rebuild the Meilisearch index from Directus data.</p>
            </div>
            <ReindexButton />
          </div>
        </div>
      </div>
    </div>
  );
}

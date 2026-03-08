import { Metadata } from 'next';
import { getInquiry, type InquiryItem } from '@/lib/inquiries';
import Link from 'next/link';
import StatusButtons from './status-buttons';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Inquiry Details - Admin | WAIMO',
  description: 'View and manage inquiry details.',
  robots: 'noindex, nofollow', // Admin pages should not be indexed
};

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  const inquiry = await getInquiry(params.id);

  if (!inquiry) {
    return <div className="px-6 py-10 text-center text-white/70">Inquiry not found</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-white">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/admin/inquiries" className="text-blue-200 hover:text-white text-xs uppercase tracking-[0.3em]">
            &larr; Back to List
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">Inquiry Details</h1>
          <p className="text-sm text-white/60">{inquiry.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-white/60">Status</span>
          <StatusButtons id={inquiry.id} currentStatus={inquiry.status || 'new'} />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Customer Information</h2>
        </div>
        <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Customer Name</p>
            <div className="mt-2 text-xl font-semibold text-white">
              {inquiry.customer_name}
              {inquiry.app_user_id && (
                <span className="ml-3 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100">
                  Registered
                </span>
              )}
            </div>
            {inquiry.app_user_id && <div className="text-xs text-white/50 mt-1">ID: {inquiry.app_user_id}</div>}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Date Created</p>
            <div className="mt-2 text-white/80">{new Date(inquiry.date_created).toLocaleString()}</div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Email</p>
            <div className="mt-2 text-white/80">{inquiry.email}</div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Company</p>
            <div className="mt-2 text-white/80">{inquiry.company || '-'}</div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Country</p>
            <div className="mt-2 text-white/80">{inquiry.country || '-'}</div>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Message</p>
          <div className="mt-2 rounded-2xl bg-black/30 p-4 text-sm text-white/80 whitespace-pre-wrap">
            {inquiry.message || 'No message'}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Items ({inquiry.items?.length || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-white/60">
              <tr>
                <th className="px-6 py-3 text-left">Product ID</th>
                <th className="px-6 py-3 text-left">Quantity</th>
                <th className="px-6 py-3 text-left">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {inquiry.items && inquiry.items.length > 0 ? (
                inquiry.items.map((item: InquiryItem) => (
                  <tr key={item.id} className="text-white/80">
                    <td className="px-6 py-4 whitespace-nowrap">{item.product_id || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 text-white/60">{item.remark || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-white/60">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

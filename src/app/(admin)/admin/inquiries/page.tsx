import { Metadata } from 'next';
import { getInquiries } from '@/lib/inquiries';
import type { Inquiry } from '@/lib/inquiries';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Inquiries Management - Admin | WAIMO',
  description: 'Manage and track customer RFQs and quotes.',
  robots: 'noindex, nofollow', // Admin pages should not be indexed
};

interface Props {
  searchParams: {
    status?: string;
  };
}

export default async function InquiriesPage({ searchParams }: Props) {
  const currentStatus = searchParams.status || 'all';
  const inquiries = await getInquiries(50, currentStatus);

  const statuses = ['all', 'new', 'processing', 'closed', 'archived'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Admin Console</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Inquiries Management</h1>
            <p className="text-sm text-white/70">Review and update RFQ pipeline status.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Link
                key={status}
                href={`/admin/inquiries?status=${status}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition ${
                  currentStatus === status
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 overflow-x-auto md:overflow-visible scrollbar-hidden rounded-[28px] border border-white/10 bg-[#050915]/80 shadow-xl">
          <table className="min-w-[1100px] md:min-w-0 w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-white/60">
              <tr>
                {['Date', 'Customer', 'Account', 'Company', 'Country', 'Status', 'Action'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inquiries.length > 0 ? (
                inquiries.map((inquiry: Inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-white/70">
                      {new Date(inquiry.date_created).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      <div className="font-semibold">{inquiry.customer_name}</div>
                      <div className="text-xs text-white/60">{inquiry.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inquiry.app_user_id ? (
                        <span className="inline-flex rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-200">
                          Registered
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                          Guest
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/80">{inquiry.company || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/80">{inquiry.country || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          inquiry.status === 'new'
                            ? 'bg-emerald-400/20 text-emerald-200'
                            : inquiry.status === 'processing'
                            ? 'bg-blue-400/20 text-blue-200'
                            : inquiry.status === 'closed'
                            ? 'bg-white/10 text-white/70'
                            : 'bg-amber-400/20 text-amber-200'
                        }`}
                      >
                        {inquiry.status?.toUpperCase() || 'NEW'}
                      </span>
                    </td>
                    <td className="min-w-[90px] px-6 py-4 text-right text-blue-200 hover:text-white whitespace-nowrap">
                      <Link href={`/admin/inquiries/${inquiry.id}`}>View</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-white/60">
                    No inquiries found.
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

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
    return <div>Inquiry not found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Link href="/admin/inquiries" className="text-blue-600 hover:underline text-sm font-semibold">
            &larr; Back to List
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Inquiry Details</h1>
          <p className="text-sm text-gray-500">{inquiry.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">Status</span>
          <StatusButtons id={inquiry.id} currentStatus={inquiry.status || 'new'} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-900">Customer Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Customer Name</label>
            <div className="mt-1 text-lg text-gray-900">
              {inquiry.customer_name}
              {inquiry.app_user_id && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 align-middle">
                  Registered
                </span>
              )}
            </div>
            {inquiry.app_user_id && (
               <div className="text-xs text-gray-400 mt-1">ID: {inquiry.app_user_id}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Date Created</label>
            <div className="mt-1 text-gray-900">
              {new Date(inquiry.date_created).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <div className="mt-1 text-gray-900">{inquiry.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Company</label>
            <div className="mt-1 text-gray-900">{inquiry.company || '-'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Country</label>
            <div className="mt-1 text-gray-900">{inquiry.country || '-'}</div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-500 mb-2">Message</label>
          <div className="bg-gray-50 p-4 rounded text-gray-800 whitespace-pre-wrap">
            {inquiry.message || 'No message'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Items ({inquiry.items?.length || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {inquiry.items && inquiry.items.length > 0 ? (
                inquiry.items.map((item: InquiryItem) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.product_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.remark || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
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

import { Metadata } from 'next';
import { getInquiry, type InquiryItem } from '@/lib/inquiries';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Inquiry Details | WAIMO',
  description: 'View inquiry details.',
};

export default async function MyInquiryDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/my/inquiries/${params.id}`);
  }

  const inquiry = await getInquiry(params.id);

  // Security Check: Ensure inquiry exists and belongs to the current user
  if (!inquiry || inquiry.app_user_id !== session.user.id) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-[60vh]">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link href="/my/inquiries" className="text-blue-600 hover:underline text-sm font-semibold">
            &larr; Back to My Inquiries
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Inquiry Details</h1>
          <p className="text-sm text-gray-500">#{inquiry.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">Status</span>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
            ${inquiry.status === 'new' ? 'bg-green-100 text-green-800' : 
              inquiry.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
              inquiry.status === 'closed' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'}`}>
            {inquiry.status?.toUpperCase() || 'NEW'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-900">Your Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Name</label>
            <div className="mt-1 text-lg text-gray-900">{inquiry.customer_name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Date Submitted</label>
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Inquired Items ({inquiry.items?.length || 0})</h2>
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
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No specific items listed.
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

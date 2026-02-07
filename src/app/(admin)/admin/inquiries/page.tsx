import { Metadata } from 'next';
import { getInquiries } from '@/lib/inquiries';
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
        <div>
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Admin Console</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Inquiries Management</h1>
          <p className="text-sm text-gray-500 mt-2">Review and update RFQ pipeline status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Link
              key={status}
              href={`/admin/inquiries?status=${status}`}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                currentStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inquiries.length > 0 ? (
              inquiries.map((inquiry: any) => (
                <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inquiry.date_created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>{inquiry.customer_name}</div>
                    <div className="text-gray-400 font-normal">{inquiry.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.app_user_id ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Registered
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Guest
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.country || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${inquiry.status === 'new' ? 'bg-green-100 text-green-800' : 
                        inquiry.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                        inquiry.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {inquiry.status?.toUpperCase() || 'NEW'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {inquiry.message || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">
                    <Link href={`/admin/inquiries/${inquiry.id}`}>View</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No inquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

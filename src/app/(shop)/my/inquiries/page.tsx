import { Metadata } from 'next';
import { getInquiries } from '@/lib/inquiries';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Always fresh for user

export const metadata: Metadata = {
  title: 'My Inquiries | WAIMO',
  description: 'View your inquiry history.',
};

export default async function MyInquiriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/my/inquiries');
  }

  const inquiries = await getInquiries(50, 'all', session.user.id);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-[60vh]">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Inquiries</h1>
          <p className="text-sm text-gray-500 mt-2">Track the status of your requests for quotation.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiry ID</th>
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
                    #{inquiry.id}
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
                    <Link href={`/my/inquiries/${inquiry.id}`}>View Details</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <p>You haven&apos;t submitted any inquiries yet.</p>
                  <Link href="/products" className="text-blue-600 hover:underline mt-2 inline-block">
                    Browse Products
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

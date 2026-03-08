import AdminHeader from '@/components/layout/admin-header';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login?callbackUrl=%2Fadmin%2Fdashboard');
  }

  return (
    <div className="admin-theme flex min-h-screen flex-col bg-[#03050a] text-white">
      <AdminHeader />
      <main className="flex-grow bg-gradient-to-br from-[#050a15] via-[#05060d] to-[#010203]">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
          <div className="grid-overlay h-full w-full" />
        </div>
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}

import Link from 'next/link';
import AdminLogoutBtn from './admin-logout-btn';

export default function AdminHeader() {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="flex-shrink-0 flex items-center font-bold text-xl text-white tracking-tight">
              WAIMO <span className="ml-2 text-slate-400 font-normal text-sm">Admin Console</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/admin/dashboard" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/inquiries" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                Inquiries
              </Link>
              <Link href="/admin/products" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                Products
              </Link>
              <Link href="/admin/users" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                Users
              </Link>
              <Link href="/admin/settings/email" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-slate-300 text-sm">
                Admin
             </div>
             <AdminLogoutBtn />
             <Link href="/" className="text-xs text-blue-400 hover:text-blue-300">
                View Site &rarr;
             </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

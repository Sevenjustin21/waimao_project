import Link from 'next/link';
import SearchInput from '@/components/search-input';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserNav from './user-nav';

export default async function MarketingHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0 flex items-center font-bold text-2xl text-blue-700 tracking-tight">
              WAIMO
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/products" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                Products
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <SearchInput />
            </div>
            <div className="flex items-center gap-3 ml-4 border-l pl-4 border-gray-200">
               <UserNav user={session?.user} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

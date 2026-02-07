import Link from 'next/link';
import SearchInput from '../../components/search-input';

export default function Header() {
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
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                Dashboard
              </Link>
              <Link href="/inquiries" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                Admin
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <SearchInput />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

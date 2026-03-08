import Link from 'next/link';
import SearchInput from '@/components/search-input';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserNav from './user-nav';

export default async function MarketingHeader() {
  const session = await getServerSession(authOptions);

  const navItems = [
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '/products?view=categories' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(5,9,15,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="flex flex-col font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]"
          >
            WAIMO
            <span className="text-[0.6rem] font-normal tracking-[0.4em] text-[var(--color-text-muted)]">
              Industrial Supply
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--color-text-muted)] md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative transition hover:text-white"
              >
                {item.label}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 scale-x-0 bg-[var(--color-primary)] transition-transform duration-200 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden w-56 lg:block">
            <SearchInput />
          </div>
          <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-4">
            <UserNav user={session?.user} />
          </div>
        </div>
      </div>
    </header>
  );
}

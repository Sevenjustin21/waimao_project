import Link from 'next/link';
import AdminLogoutBtn from './admin-logout-btn';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/settings/email', label: 'Settings' },
];

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[#05060b]">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/admin/dashboard"
            className="text-sm font-semibold uppercase tracking-[0.45em] text-[var(--color-text-muted)]"
          >
            WAIMO
            <span className="ml-4 text-xs tracking-[0.4em] text-[var(--color-primary)]">
              CONTROL
            </span>
          </Link>
          <nav className="hidden items-center gap-4 text-xs font-semibold text-[var(--color-text-muted)] md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1 transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
          <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-1">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
            Operational
          </span>
          <AdminLogoutBtn />
          <Link
            href="/"
            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--color-text-muted)] hover:text-white"
          >
            View Site
          </Link>
        </div>
      </div>
    </header>
  );
}

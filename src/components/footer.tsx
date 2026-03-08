import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-16 border-t border-[rgba(255,255,255,0.08)] bg-[var(--color-surface)] text-white">
      <div className="absolute inset-0 opacity-30">
        <div className="grid-overlay h-full w-full" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[var(--color-text-muted)]">
              WAIMO INDUSTRIAL
            </p>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              Export-ready precision fasteners. ISO/DIN compliant products, 100% traceable supply
              chain, 24h quotation support.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-[var(--color-text-muted)]">
              SITE MAP
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-white/80 hover:text-white">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/products?view=categories" className="text-white/80 hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/my/inquiries" className="text-white/80 hover:text-white">
                  My Inquiries
                </Link>
              </li>
              <li>
                <a href="/#contact" className="text-white/80 hover:text-white">
                  Contact Sales
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-[var(--color-text-muted)]">
              CERTIFICATION
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>ISO 9001:2015 Quality Management</li>
              <li>RoHS / REACH Compliance</li>
              <li>Material traceability (EN10204 3.1)</li>
              <li>Custom inspection reporting</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-[var(--color-text-muted)]">
              CONTACT
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>sales@waimo-industrial.com</li>
              <li>+86 571 8888 8888</li>
              <li>08:30–22:00 CST (Mon–Sat)</li>
              <li>Hangzhou · Ningbo · Hamburg</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-text-muted)] md:flex-row md:items-center md:justify-between">
          <p>© {year} WAIMO Industrial Supply. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white">
              Terms of Use
            </a>
            <span>CN ICP Filing: TBD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

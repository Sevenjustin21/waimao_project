import MarketingHeader from '@/components/layout/marketing-header';
import Footer from '@/components/footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <MarketingHeader />
      <main className="flex-grow">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-10">
          <div className="grid-overlay h-full w-full" />
        </div>
        <div className="relative z-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

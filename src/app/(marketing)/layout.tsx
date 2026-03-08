import MarketingHeader from '@/components/layout/marketing-header';
import Footer from '@/components/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-white">
      <MarketingHeader />
      <main className="flex-grow bg-gradient-to-b from-[rgba(17,24,39,0.85)] via-[rgba(5,9,15,1)] to-[rgba(5,9,15,1)]">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
          <div className="grid-overlay h-full w-full" />
        </div>
        <div className="relative z-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

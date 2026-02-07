import MarketingHeader from '@/components/layout/marketing-header';
import Footer from '@/components/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

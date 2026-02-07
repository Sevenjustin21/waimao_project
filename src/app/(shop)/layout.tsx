import MarketingHeader from '@/components/layout/marketing-header';
import Footer from '@/components/footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <MarketingHeader />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

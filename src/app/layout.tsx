import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WAIMO - Industrial Fasteners & Components B2B Trade Platform',
  description: 'Leading independent B2B platform for industrial fasteners, bolts, screws and components. Export-ready products with fast quotes, competitive pricing, and global logistics support.',
  keywords: ['fasteners', 'bolts', 'screws', 'industrial components', 'B2B', 'export', 'wholesale'],
  robots: 'index, follow',
  openGraph: {
    title: 'WAIMO - Industrial Fasteners B2B Trade',
    description: 'Get instant quotes for industrial fasteners and components with export-ready logistics.',
    type: 'website',
    url: 'https://waimo.export',
    siteName: 'WAIMO',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WAIMO - Industrial Fasteners B2B',
    description: 'Professional B2B fasteners export platform',
  },
  alternates: {
    canonical: 'https://waimo.export',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Schema.org organization markup */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'WAIMO Industrial',
              url: 'https://waimo.export',
              logo: 'https://waimo.export/logo.png',
              description: 'B2B industrial fasteners and components export platform',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-XXX-XXX-XXXX',
                contactType: 'Customer Service',
              },
            }),
          }}
        />
      </head>
      <body className="bg-gray-50 min-h-screen flex flex-col font-sans text-gray-900">
        {children}
      </body>
    </html>
  );
}

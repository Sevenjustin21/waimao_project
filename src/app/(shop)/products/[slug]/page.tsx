import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import Link from 'next/link';
import RFQForm from '@/components/rfq-form';
import ImageGallery from '@/components/image-gallery';
import { getProductGallery } from '@/lib/product-gallery';

interface Props {
  params: {
    slug: string;
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

async function getProductBySlug(slug: string) {
  try {
    const items = await directus.request(
      readItems('products', {
        filter: { 
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        fields: [
          'id', 'sku', 'name', 'slug', 'description', 
          'price_text', 'moq', 'lead_time_days', 'material_summary',
          { category_id: ['name', 'slug'] },
          'image_id',
          { image_id: ['id', 'title'] },
          { 
            attribute_values: [
              'value_text', 
              'value_number',
              { attribute_id: ['key', 'name', 'type'] }
            ] 
          }
        ] as any,
        limit: 1
      })
    );
    
    return (items as any[])[0] || null;
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist.',
    };
  }

  const baseUrl = 'https://waimo.export';
  const productUrl = `${baseUrl}/products/${product.slug}`;
  
  const metaDescription = product.description
    ? product.description.substring(0, 160)
    : `Get a quote for ${product.name} (SKU: ${product.sku}). Industrial fastener with reliable quality.`;

  return {
    title: `${product.name} | Buy Online - WAIMO Industrial`,
    description: metaDescription,
    keywords: [
      product.name,
      product.sku,
      product.category_id?.name,
      'buy online',
      'industrial fasteners',
      'export',
    ].filter(Boolean),
    openGraph: {
      title: `${product.name} - WAIMO`,
      description: metaDescription,
      type: 'website',
      url: productUrl,
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const specs = product.attribute_values || [];
  const assetBase = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || '/api/assets').replace(/\/$/, '');
  const galleryRecords = await getProductGallery(product.id);
  const galleryUrls = galleryRecords.map((record) => `${assetBase}/${record.fileId}`);

  // Construct image URLs
  const mainImageId = (product as any).image_id?.id || (product as any).image_id;
  const imageUrls =
    galleryUrls.length > 0
      ? galleryUrls
      : (mainImageId ? [`${assetBase}/${mainImageId}`] : []);

  const baseUrl = 'https://waimo.export';
  const productUrl = `${baseUrl}/products/${product.slug}`;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: `${baseUrl}/products`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.category_id?.name || 'Category',
            item: product.category_id?.slug 
              ? `${baseUrl}/categories/${product.category_id.slug}`
              : `${baseUrl}/products`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.name,
            item: productUrl,
          },
        ],
      },
      {
        '@type': 'Product',
        name: product.name,
        description: product.description || `High-quality industrial fastener with SKU ${product.sku}`,
        sku: product.sku,
        url: productUrl,
        brand: {
          '@type': 'Brand',
          name: 'WAIMO Industrial',
        },
        category: product.category_id?.name || 'Industrial Products',
      },
    ],
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
             <nav className="flex text-sm font-medium text-gray-500">
               <Link href="/" className="hover:text-gray-900">Home</Link>
               <span className="mx-2">/</span>
               <Link href="/products" className="hover:text-gray-900">Products</Link>
               {product.category_id?.name && (
                 <>
                   <span className="mx-2">/</span>
                   <span className="text-gray-500">{product.category_id?.name}</span>
               </>
               )}
               <span className="mx-2">/</span>
               <span className="text-gray-900 truncate">{product.name}</span>
             </nav>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          <div className="mb-10 lg:mb-0">
             <ImageGallery images={imageUrls} />
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-sm text-blue-600 font-bold tracking-wide uppercase mb-2">
                {product.category_id?.name || 'Industrial Part'}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-gray-500 mb-4">SKU: <span className="font-mono text-gray-900">{product.sku}</span></p>
              
              <div className="text-sm text-gray-700 leading-relaxed">
                <p>{product.description || 'High-quality industrial fastener manufactured to precise standards. Suitable for heavy-duty applications.'}</p>
              </div>

              {/* Commercial Terms Block */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Commercial Terms</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {(product as any).price_text && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Price</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-semibold">{(product as any).price_text}</dd>
                    </div>
                  )}
                  {(product as any).moq && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">MOQ</dt>
                      <dd className="mt-1 text-sm text-gray-900">{(product as any).moq} Pieces</dd>
                    </div>
                  )}
                  {(product as any).lead_time_days && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Lead Time</dt>
                      <dd className="mt-1 text-sm text-gray-900">~{(product as any).lead_time_days} Days</dd>
                    </div>
                  )}
                  {(product as any).material_summary && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Material</dt>
                      <dd className="mt-1 text-sm text-gray-900">{(product as any).material_summary}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Specifications</h3>
                <div className="flex flex-wrap gap-2">
                  {specs.slice(0, 5).map((attr: any, idx: number) => {
                     const val = attr.attribute_id?.type === 'number' ? attr.value_number : attr.value_text;
                     const name = attr.attribute_id?.name || attr.attribute_id?.key;
                     return (
                       <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                         <span className="text-gray-500 mr-2">{name}:</span> {val}
                       </span>
                     );
                  })}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <a href="#rfq" className="flex-1 bg-blue-600 border border-transparent rounded-xl py-3 px-8 flex items-center justify-center text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-200 transition-all">
                  Request a Quote
                </a>
                <button className="flex-none bg-white border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                   </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="lg:grid lg:grid-cols-[240px,1fr] gap-8">
            <div className="space-y-3">
              <input id="tab-specs" name="product-tab" type="radio" defaultChecked className="peer/specs sr-only" />
              <label htmlFor="tab-specs" className="block w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors peer-checked/specs:border-blue-600 peer-checked/specs:bg-blue-600 peer-checked/specs:text-white">
                Specifications
              </label>

              <input id="tab-packaging" name="product-tab" type="radio" className="peer/packaging sr-only" />
              <label htmlFor="tab-packaging" className="block w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors peer-checked/packaging:border-blue-600 peer-checked/packaging:bg-blue-600 peer-checked/packaging:text-white">
                Packaging & Lead Time
              </label>

              <input id="tab-faq" name="product-tab" type="radio" className="peer/faq sr-only" />
              <label htmlFor="tab-faq" className="block w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors peer-checked/faq:border-blue-600 peer-checked/faq:bg-blue-600 peer-checked/faq:text-white">
                FAQ
              </label>
            </div>

            <div>
              <div className="hidden peer-checked/specs:block">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h4>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {specs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No detailed specifications available.</div>
                ) : (
                  <div className="divide-y divide-dashed divide-gray-200">
                    {specs.map((attr: any, idx: number) => {
                      const name = attr.attribute_id?.name || attr.attribute_id?.key;
                      const val = attr.attribute_id?.type === 'number' ? attr.value_number : attr.value_text;
                      return (
                        <div key={idx} className="flex items-center gap-4 py-4 text-sm">
                          <span className="w-48 text-xs uppercase tracking-wide text-gray-500">{name}</span>
                          <span className="flex-1 border-t border-dotted border-gray-300" />
                          <span className="w-48 text-right font-semibold text-gray-900">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                </div>
              </div>

              <div className="hidden peer-checked/packaging:block">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Packaging & Lead Time</h4>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Packaging</p>
                    <p className="mt-3 text-sm text-gray-700">Neutral export cartons with moisture protection. Palletized for long-distance shipment.</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Lead Time</p>
                    <p className="mt-3 text-sm text-gray-700">Standard items ship in 7-15 days. Custom specs quoted within 24 hours.</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">MOQ</p>
                    <p className="mt-3 text-sm text-gray-700">Flexible, based on size and material. Mixed containers available.</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Certificates</p>
                    <p className="mt-3 text-sm text-gray-700">Mill test reports and compliance certificates available on request.</p>
                  </div>
                </div>
              </div>

              <div className="hidden peer-checked/faq:block">
                <h4 className="text-xl font-bold text-gray-900 mb-6">FAQ</h4>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">Can you provide samples before bulk orders?</p>
                    <p className="mt-2 text-sm text-gray-700">Yes. Samples are available for verification, shipping cost may apply.</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">Do you support OEM labels and packing?</p>
                    <p className="mt-2 text-sm text-gray-700">OEM packaging, labels, and barcodes are available for container orders.</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">What documents are included with shipment?</p>
                    <p className="mt-2 text-sm text-gray-700">We provide packing list, commercial invoice, and certificate files as required.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-6xl mx-auto">
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-8 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Request a Quote</h3>
                <p className="mt-2 text-sm text-gray-600">Share your requirements and receive pricing, lead time, and logistics options tailored to your market.</p>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Fast Response</p>
                    <p className="mt-2 text-sm text-gray-700">Quotes returned within 24 hours for standard SKUs.</p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Logistics Ready</p>
                    <p className="mt-2 text-sm text-gray-700">FOB, CIF, and DDP options with export compliance support.</p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Quality Assurance</p>
                    <p className="mt-2 text-sm text-gray-700">Mill certificates and inspection reports available.</p>
                  </div>
                </div>
              </div>
              <RFQForm product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

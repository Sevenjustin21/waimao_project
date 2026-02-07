import Link from 'next/link';
import Image from 'next/image';
import { ProductDocument } from '@/lib/meilisearch';

interface ProductCardProps {
  product: ProductDocument;
}

export default function ProductCard({ product }: ProductCardProps) {
  const specs = Object.entries(product)
    .filter(([key]) => key.startsWith('attr_'))
    .slice(0, 3);
  const imageUrl = (product as any).image_url as string | undefined;

  return (
    <div className="group border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
        <span className="sr-only">View {product.name}</span>
      </Link>

      <div className="relative w-full bg-gray-100 overflow-hidden aspect-[4/3]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            priority={false}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-50 group-hover:to-gray-100 transition-colors">
            <svg className="h-12 w-12 text-gray-400 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
             {product.category_name || 'Part'}
           </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 flex-1">
          {specs.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
            >
              {key.replace('attr_', '').toUpperCase()}: {value}
            </span>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 z-10 relative">
          <Link 
            href={`/products/${product.slug}#rfq`}
            className="w-full flex justify-center items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
          >
            Request Quote
          </Link>
        </div>
      </div>
    </div>
  );
}

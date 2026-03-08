import Image from 'next/image';
import Link from 'next/link';
import { ProductDocument } from '@/lib/meilisearch';

interface ProductCardProps {
  product: ProductDocument;
}

const fallbackBlueprint = (
  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent)] text-white/30">
    <div className="h-16 w-16 border border-dashed border-white/30" />
    <div className="absolute inset-8 border border-dashed border-white/20" />
    <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 border border-dashed border-white/20" />
    <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 border border-dashed border-white/20" />
  </div>
);

export default function ProductCard({ product }: ProductCardProps) {
  const specs = Object.entries(product)
    .filter(([key]) => key.startsWith('attr_'))
    .slice(0, 3);
  const imageUrl = (product as any).image_url as string | undefined;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-transparent bg-white/5 p-5 text-white transition hover:border-blue-500/50">
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">{product.name}</span>
      </Link>
      <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-[#0b1322]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            unoptimized
          />
        ) : (
          fallbackBlueprint
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
          {product.category_name || 'PART'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          <div className="mt-1 text-xs text-blue-200">
            <span className="font-mono">{product.sku}</span>
            {product.category_slug && (
              <>
                {' · '}
                <span className="font-mono">{product.category_slug}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          {specs.map(([key, value]) => (
            <span
              key={key}
              className="rounded-full border border-white/15 px-3 py-1 text-[0.7rem] font-semibold text-white/80"
            >
              {key.replace('attr_', '').toUpperCase()}: {value}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-white/60">
          <span className="font-mono">DIN / ISO / ANSI Ready</span>
          <Link
            href={`/products/${product.slug}#rfq`}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-[0.7rem] uppercase tracking-[0.3em] text-white hover:border-blue-400"
          >
            RFQ
          </Link>
        </div>
      </div>
    </article>
  );
}

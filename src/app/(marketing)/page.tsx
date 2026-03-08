import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Factory, Shield, Truck } from 'lucide-react';

const partnerLogos = ['Siemens', 'Bosch', 'ABB', 'Bekaert', 'SKF', 'Mitsubishi'];

const categories = [
  {
    title: 'Hex & Socket Assemblies',
    description: 'DIN / ISO bolts with 3.1 certification for energy & infrastructure projects.',
    image: '/assets/home/category-hex.jpg',
  },
  {
    title: 'Surface Treatment Line',
    description: 'Zinc-nickel, Dacromet and phosphate coating for marine-grade durability.',
    image: '/assets/home/category-surface.jpg',
  },
  {
    title: 'High-Strength Nuts',
    description: 'A2-70 / A4-80 / 10.9 alloys with full traceability and torque testing.',
    image: '/assets/home/category-nuts.jpg',
  },
  {
    title: 'Washer & Spacer Program',
    description: 'Precision stamped washers supporting EN, ASTM and GB standards.',
    image: '/assets/home/category-washers.jpg',
  },
];

export default function LandingPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <section className="relative mx-auto grid max-w-7xl gap-16 px-4 py-20 lg:grid-cols-[1fr_520px] lg:py-28">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-blue-200">Precision Supply</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Precision Fastening Solutions for Global OEM Supply Chains
            </h1>
            <p className="mt-6 max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
              From DIN 933 bolts to aerospace-grade components, WAIMO integrates sourcing, testing
              and export documentation into a single industrial supply stack. Dedicated inspectors,
              24h quotation SLA, and digitalized traceability keep your production moving.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="group flex items-center gap-3 rounded-full border border-blue-500/60 bg-blue-500/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500/30"
            >
              Browse Catalog
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white/80 hover:text-white"
            >
              Request a Quote
            </Link>
            <Link
              href="/#contact"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white/80 hover:text-white"
            >
              Contact Sales
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Shield className="h-5 w-5 text-blue-300" />,
                label: 'ISO 9001 | ISO 14001',
                copy: 'Full QMS audit trail, PPAP & 3.1 certificates.',
              },
              {
                icon: <Factory className="h-5 w-5 text-blue-300" />,
                label: '6 Production partners',
                copy: 'Cold forging / CNC / heat treatment / coating lines.',
              },
              {
                icon: <Truck className="h-5 w-5 text-blue-300" />,
                label: 'Global Logistics',
                copy: 'FOB Ningbo / CIF Hamburg / bonded warehouse readiness.',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-blue-200">
                  {item.icon}
                  {item.label}
                </div>
                <p className="mt-3 text-sm text-white/80">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[520px] overflow-hidden rounded-[32px] border border-white/15 bg-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.55)] lg:h-[600px]">
          <Image
            src="/assets/home/578A2002_2560.jpg"
            alt="Heavy industrial production line"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="border-y border-white/5 bg-white/5">
        <div className="marquee flex overflow-hidden">
          <div className="marquee__inner flex min-w-full justify-around gap-10 py-6 text-xs uppercase tracking-[0.6em] text-white/50">
            {partnerLogos.map((partner) => (
              <span key={partner}>{partner}</span>
            ))}
          </div>
          <div className="marquee__inner flex min-w-full justify-around gap-10 py-6 text-xs uppercase tracking-[0.6em] text-white/50">
            {partnerLogos.map((partner) => (
              <span key={`${partner}-clone`}>{partner}</span>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Core Programs</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Catalogued assemblies with dedicated QA playbooks
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-200 hover:text-white"
          >
            Explore All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group relative overflow-hidden rounded-[28px] border border-white/10"
            >
              <div className="aspect-[4/3]">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.35em] text-blue-200">{category.title}</p>
                <p className="text-base text-white/90">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

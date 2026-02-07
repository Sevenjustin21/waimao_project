import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <div className="mt-24 sm:mt-32 lg:mt-16">
                  <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm font-semibold leading-6 text-blue-600 ring-1 ring-inset ring-blue-600/10">
                    Industrial Quality
                  </span>
                </div>
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Premium Fasteners & Components
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Direct sourcing for B2B industrial clients. High-quality bolts, nuts, and washers with export-ready documentation and global logistics.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/products"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Browse Catalog
                  </Link>
                  <Link href="/products" className="text-sm font-semibold leading-6 text-gray-900">
                    Request Quote <span aria-hidden="true" className="ml-1 inline-block">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
             <div className="bg-gray-100 rounded-xl shadow-xl overflow-hidden p-8 h-full flex items-center justify-center border border-gray-200">
                <div className="text-center">
                   <div className="text-6xl mb-4">馃敥</div>
                   <p className="text-gray-500">High-Res Product Images Coming Soon</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}



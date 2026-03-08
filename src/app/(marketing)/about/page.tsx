import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About WAIMO · Precision Fastening Supply',
  description:
    'Learn how WAIMO integrates sourcing, inspection and digital traceability to deliver industrial fasteners worldwide.',
};

const milestones = [
  {
    year: '2014',
    title: 'Zhejiang · Hangzhou · Ningbo',
    desc: 'Consolidated three cold-heading plants and two finishing lines to build the WAIMO supply core.',
  },
  {
    year: '2018',
    title: 'Digital Quality System',
    desc: 'Launched a traceable Batch Traveler linking PPAP / 3.1 / COC files with warehouse locations.',
  },
  {
    year: '2022',
    title: 'Global Fulfillment Network',
    desc: 'Established bonded hubs in Hamburg and Houston to support cross-region VMI programs.',
  },
];

export default function AboutPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-10">
        <div className="grid-overlay h-full w-full" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.5em] text-blue-200">About WAIMO</p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
          We rebuilt the fastening supply chain into a data-driven service
        </h1>
        <p className="mt-6 max-w-3xl text-base text-[color:var(--color-text-muted)] sm:text-lg">
          WAIMO was born inside the coastal manufacturing clusters of Zhejiang. We orchestrate cold heading,
          heat treatment, and finishing lines with resident quality engineers plus digital traceability, so OEM
          customers get transparent, controllable fastening programs. From RFQ to shipment, every step is backed
          by production data and quality milestones to keep critical fasteners on schedule.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-3">
        {[
          {
            title: 'Inspection Lab',
            body: '40+ torque, metallography, coating, salt spray, and tensile test items with third-party witnessing.',
          },
          {
            title: 'Supply Orchestration',
            body: 'Integrates 18 long-term partner lines to support mixed batches, shared tooling, and VMI rollouts.',
          },
          {
            title: 'Compliance & ESG',
            body: 'RoHS / REACH / IATF compliant with scrap metal recovery programs that reduce customer waste.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-blue-200">{card.title}</p>
            <p className="mt-4 text-sm text-white/80">{card.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Timeline</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">WAIMO Milestones</h2>
            </div>
            <div className="space-y-6">
              {milestones.map((item) => (
                <div key={item.year} className="flex gap-6 border-l border-dashed border-white/20 pl-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200">
                    {item.year}
                  </div>
                  <div>
                    <p className="text-white">{item.title}</p>
                    <p className="text-sm text-white/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

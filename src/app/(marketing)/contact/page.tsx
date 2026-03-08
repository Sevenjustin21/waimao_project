import ContactForm from './contact-form';

export const metadata = {
  title: 'Contact WAIMO · Industrial RFQ Desk',
  description: 'Reach WAIMO for fastener sourcing, inspection scheduling, or logistics coordination.',
};

const offices = [
  {
    title: 'Hangzhou HQ',
    info: ['No. 568, Qiantang Industrial Park', 'Zhejiang, China', 'Tel: +86 571 8888 8888'],
  },
  {
    title: 'Hamburg Hub',
    info: ['Peutestrasse 10, 20539', 'Hamburg, Germany', 'Tel: +49 40 123 456'],
  },
  {
    title: 'Houston Office',
    info: ['4800 San Felipe St.', 'Houston, TX 77056, USA', 'Tel: +1 713 555 0199'],
  },
];

export default function ContactPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-10">
        <div className="grid-overlay h-full w-full" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Contact</p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
          Share your requirements and our onsite engineers will reply within 24 hours
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[color:var(--color-text-muted)]">
          RFQs, pilot builds, supplier audits, inspection schedules—use the form, email, or phone below to reach the
          WAIMO team and we will coordinate immediately.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr,1.1fr]">
        <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
          {offices.map((office) => (
            <div key={office.title} className="border-b border-white/10 pb-4 last:border-none last:pb-0">
              <p className="text-xs uppercase tracking-[0.4em] text-blue-200">{office.title}</p>
              <ul className="mt-2 text-sm text-white/80">
                {office.info.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-blue-200">Email</p>
            <a href="mailto:sales@waimo-industrial.com" className="mt-2 block text-sm text-white/80">
              sales@waimo-industrial.com
            </a>
          </div>
        </div>

        <ContactForm />
      </section>
    </div>
  );
}

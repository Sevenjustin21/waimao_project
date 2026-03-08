'use client';

import Link from 'next/link';
import { useState } from 'react';

interface RFQFormProps {
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

export default function RFQForm({ product }: RFQFormProps) {
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      customer_name: formData.get('customer_name'),
      email: formData.get('email'),
      company: formData.get('company'),
      country: formData.get('country'),
      message: formData.get('message'),
      website: formData.get('website'),
      items: [
        {
          product_id: product.id,
          quantity: Number(formData.get('quantity')),
          remark: formData.get('remark'),
        },
      ],
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        setSuccessId(result.inquiry_id);
        (e.currentTarget as HTMLFormElement).reset();
      } else {
        setError(result.message || 'Failed to submit inquiry');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <div className="rounded-[32px] border-2 border-blue-500/30 bg-[rgba(2,6,23,0.55)] p-8 text-white shadow-[0_25px_60px_rgba(2,6,23,0.65)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/30">
          <span className="text-2xl text-blue-200 animate-pulse">✓</span>
        </div>
        <h3 className="text-center text-2xl font-semibold">Inquiry submitted</h3>
        <p className="mt-3 text-center text-sm text-blue-100">
          Reference ID · <span className="font-mono text-white">{successId}</span>
        </p>
        <p className="mt-1 text-center text-xs text-[color:var(--color-text-muted)]">
          We will send pricing and lead-time proposals within 24 hours.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setSuccessId(null)}
            className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white hover:border-blue-400"
          >
            Start another inquiry
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white hover:border-blue-400"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border-2 border-blue-500/20 bg-[rgba(2,6,23,0.65)] text-white shadow-[0_25px_60px_rgba(2,6,23,0.65)]">
      <div className="border-b border-blue-500/20 px-6 py-4">
        <p className="text-xs uppercase tracking-[0.5em] text-blue-200">RFQ Module</p>
        <h3 className="mt-2 text-2xl font-semibold">Request a Quote</h3>
        <p className="text-sm text-white/70">
          {product.name} · SKU {product.sku}
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full Name *">
              <input
                required
                name="customer_name"
                placeholder="Liang Chen"
                className="rfq-input"
              />
            </Field>
            <Field label="Email *">
              <input required name="email" type="email" placeholder="procurement@company.com" className="rfq-input" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Company">
              <input name="company" placeholder="ACME Industrial" className="rfq-input" />
            </Field>
            <Field label="Country">
              <input name="country" placeholder="DE / US / VN ..." className="rfq-input" />
            </Field>
          </div>

          <Field label="Quantity *">
            <input
              required
              name="quantity"
              type="number"
              min={1}
              placeholder="10000 sets"
              className="rfq-input"
            />
          </Field>

          <Field label="Application / Notes">
            <textarea
              name="message"
              rows={4}
              placeholder="Specify coating, packing, inspection or delivery terms..."
              className="rfq-input resize-none"
            />
          </Field>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-industrial relative flex w-full items-center justify-center rounded-full border border-blue-500/50 bg-blue-500/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-blue-300"
            >
              {loading ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className="h-1 w-20 animate-pulse bg-white/60" />
                  Uploading Specs...
                </span>
              ) : (
                'Submit RFQ Packet'
              )}
            </button>
            <p className="mt-3 text-center text-xs text-white/60">
              Submitting generates a reference ID and auto-notifies our resident quality engineers.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
      {label}
      {children}
    </label>
  );
}

'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    setMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send message.');
      }
      setStatus('success');
      setMessage("Message received. We'll reply shortly.");
      form.reset();
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.message || 'Network error, please try again later.');
    }
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-white backdrop-blur">
      <p className="text-xs uppercase tracking-[0.4em] text-blue-200">Write to us</p>
      <h2 className="mt-2 text-2xl font-semibold">Contact Sales / QA Team</h2>
      {message && (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            status === 'success'
              ? 'border-blue-400/40 bg-blue-500/10 text-blue-100'
              : 'border-red-400/40 bg-red-500/10 text-red-100'
          }`}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full Name">
            <input name="name" required className="rfq-input" placeholder="Your name" />
          </Field>
          <Field label="Work Email">
            <input name="email" type="email" required className="rfq-input" placeholder="you@company.com" />
          </Field>
        </div>
        <Field label="Company / Project">
          <input name="company" className="rfq-input" placeholder="Company / Project code" />
        </Field>
        <Field label="Message">
          <textarea name="message" rows={5} className="rfq-input resize-none" placeholder="Describe RFQ scope, inspection, logistics or customization needs" />
        </Field>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-industrial flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white hover:border-blue-400 disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
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

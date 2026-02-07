'use client';

import { useEffect, useState } from 'react';

export default function HealthCard({ service }: { service: 'Meilisearch' | 'Directus' }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        const key = service.toLowerCase() as 'meilisearch' | 'directus';
        if (data[key]?.ok) {
          setStatus('ok');
          setLatency(data[key].latency_ms);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [service]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="px-5 py-6">
        <dt className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{service} Health</dt>
        <dd className="mt-3 flex items-baseline">
          {status === 'loading' && (
            <span className="text-2xl font-semibold text-gray-400">Checking...</span>
          )}
          {status === 'ok' && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-emerald-600">Operational</span>
              <span className="text-sm text-gray-500">({latency}ms)</span>
            </div>
          )}
          {status === 'error' && (
            <span className="text-2xl font-semibold text-red-600">Down</span>
          )}
        </dd>
      </div>
    </div>
  );
}

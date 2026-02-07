'use client';

import { useState } from 'react';

export default function ReindexButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [secret, setSecret] = useState('');

  const handleReindex = async () => {
    if (!secret) {
      setMsg('Please enter the Admin API Secret');
      return;
    }

    setLoading(true);
    setMsg('Reindexing...');
    
    try {
      const res = await fetch('/api/reindex', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secret}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Success: Synced ${data.count} products.`);
      } else {
        setMsg(`Error: ${data.message || 'Failed'}`);
      }
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter ADMIN_API_SECRET"
          className="flex-1 min-w-[220px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        />
        <button
          onClick={handleReindex}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Reindex'}
        </button>
      </div>
      {msg && (
        <p className={`mt-2 text-sm ${msg.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}

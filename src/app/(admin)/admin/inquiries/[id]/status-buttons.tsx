'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateInquiryStatusAction } from '../actions';

export default function StatusButtons({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const statuses = ['new', 'processing', 'closed'];

  const updateStatus = async (newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;

    setLoading(true);
    try {
      await updateInquiryStatusAction(id, newStatus);
      router.refresh();
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-1 rounded-full bg-white/10 p-1">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => updateStatus(status)}
          disabled={loading || currentStatus === status}
          className={`px-4 py-1 text-xs font-semibold uppercase tracking-wide rounded-full transition ${
            currentStatus === status
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'text-white/70 hover:bg-white/10'
          } disabled:opacity-50`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateInquiryStatusAction } from '../actions';

export default function StatusButtons({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    <div className="flex gap-2 rounded-full bg-gray-100 p-1">
      {['new', 'processing', 'closed'].map((status) => (
        <button
          key={status}
          onClick={() => updateStatus(status)}
          disabled={loading || currentStatus === status}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition 
            ${currentStatus === status 
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            } disabled:opacity-50`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  );
}

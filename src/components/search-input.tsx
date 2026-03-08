'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

function SearchInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.delete('filters');
    if (query.trim()) {
      params.set('q', query.trim());
      // Reset page when searching
      params.set('page', '1');
    } else {
      params.delete('q');
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-1 text-sm text-[var(--color-text-muted)] shadow-inner"
    >
      <svg
        className="h-4 w-4 text-[var(--color-text-muted)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.2-5.2M18 10a8 8 0 11-16 0 8 8 0 0116 0z"
        />
      </svg>
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:outline-none"
        placeholder="Search DIN / ISO / material..."
        autoComplete="off"
      />
    </form>
  );
}

export default function SearchInput() {
  return (
    <Suspense fallback={<div className="h-11 w-full animate-pulse rounded-full bg-[rgba(255,255,255,0.08)]" />}>
      <SearchInputContent />
    </Suspense>
  );
}

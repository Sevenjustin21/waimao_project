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
    <form onSubmit={handleSearch} className="relative text-gray-600 focus-within:text-gray-400">
      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
        <button type="submit" className="p-1 focus:outline-none focus:shadow-outline">
          <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </span>
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="py-2 text-sm text-gray-900 bg-gray-100 rounded-md pl-10 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        placeholder="Search products..."
        autoComplete="off"
      />
    </form>
  );
}

export default function SearchInput() {
  return (
    <Suspense fallback={<div className="w-full sm:w-64 h-10 bg-gray-100 rounded-md animate-pulse" />}>
      <SearchInputContent />
    </Suspense>
  );
}

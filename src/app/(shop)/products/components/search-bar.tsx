'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

function SearchBarContent() {
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
      params.set('page', '1');
    } else {
      params.delete('q');
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full text-gray-600">
      <div className="relative">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 px-5 pr-12 text-base placeholder-gray-500 border-2 border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 bg-white shadow-sm text-gray-900"
          placeholder="Search by keyword, SKU, or standard..."
          autoComplete="off"
        />
        <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
          <svg className="h-6 w-6 text-gray-400 hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={<div className="w-full h-12 bg-gray-100 rounded-lg animate-pulse" />}>
      <SearchBarContent />
    </Suspense>
  );
}

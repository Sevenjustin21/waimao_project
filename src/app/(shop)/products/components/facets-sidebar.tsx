'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FacetsSidebarProps {
  facets: Record<string, Record<string, number>>;
}

function FacetsSidebarContent({ facets }: FacetsSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentFiltersStr = searchParams.get('filters');
  let currentFilters: Record<string, string[]> = {};
  try {
    if (currentFiltersStr) {
      currentFilters = JSON.parse(currentFiltersStr);
    }
  } catch (e) {}

  const handleFilterChange = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (key === 'category_slug') {
      if (checked) {
        params.set('category', value);
      } else {
        params.delete('category');
      }
      params.delete('page'); 
      startTransition(() => router.push(`/products?${params.toString()}`));
      return;
    }

    const newFilters = { ...currentFilters };
    if (!newFilters[key]) {
      newFilters[key] = [];
    }

    if (checked) {
      if (!newFilters[key].includes(value)) {
        newFilters[key].push(value);
      }
    } else {
      newFilters[key] = newFilters[key].filter(v => v !== value);
      if (newFilters[key].length === 0) {
        delete newFilters[key];
      }
    }

    if (Object.keys(newFilters).length > 0) {
      params.set('filters', JSON.stringify(newFilters));
    } else {
      params.delete('filters');
    }
    
    params.delete('page');
    startTransition(() => router.push(`/products?${params.toString()}`));
  };

  const isChecked = (key: string, value: string) => {
    if (key === 'category_slug') {
      return searchParams.get('category') === value;
    }
    return currentFilters[key]?.includes(value);
  };

  const getLabel = (key: string) => {
    return key.replace('attr_', '').replace('category_slug', 'Category').toUpperCase();
  };

  return (
    <div className="space-y-4">
      {isPending && (
        <div className="text-xs text-blue-600 font-medium flex items-center gap-1 px-1">
          <svg className="w-3.5 h-3.5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V1a11 11 0 00-8.485 4.515L4 12z" />
          </svg>
          Updating filters…
        </div>
      )}
      {Object.entries(facets).map(([key, distribution]) => {
        if (Object.keys(distribution).length === 0) return null;
        
        return (
          <FacetSection 
            key={key} 
            title={getLabel(key)} 
            facetKey={key}
            distribution={distribution}
            isChecked={isChecked}
            onFilterChange={handleFilterChange}
            disabled={isPending}
          />
        );
      })}
    </div>
  );
}

export default function FacetsSidebar({ facets }: FacetsSidebarProps) {
  return (
    <Suspense fallback={<div className="space-y-4"><div className="h-12 bg-gray-100 rounded-xl animate-pulse" /><div className="h-12 bg-gray-100 rounded-xl animate-pulse" /></div>}>
      <FacetsSidebarContent facets={facets} />
    </Suspense>
  );
}

function FacetSection({ 
  title, 
  facetKey, 
  distribution, 
  isChecked, 
  onFilterChange,
  disabled,
}: { 
  title: string, 
  facetKey: string, 
  distribution: Record<string, number>,
  isChecked: (k: string, v: string) => boolean,
  onFilterChange: (k: string, v: string, c: boolean) => void,
  disabled?: boolean,
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-900 px-4 py-3 focus:outline-none"
      >
        <span>{title}</span>
        <span className="ml-6 flex items-center text-gray-500">
           {isOpen ? (
             <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
           ) : (
             <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
           )}
        </span>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {Object.entries(distribution).map(([value, count]) => (
            <div key={value} className={`flex items-center ${disabled ? 'opacity-60' : ''}`}>
              <input
                id={`${facetKey}-${value}`}
                type="checkbox"
                checked={isChecked(facetKey, value)}
                onChange={(e) => onFilterChange(facetKey, value, e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
              />
              <label
                htmlFor={`${facetKey}-${value}`}
                className="ml-3 min-w-0 flex-1 text-sm text-gray-600 cursor-pointer hover:text-gray-900"
              >
                {value} <span className="text-gray-400 text-xs">({count})</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

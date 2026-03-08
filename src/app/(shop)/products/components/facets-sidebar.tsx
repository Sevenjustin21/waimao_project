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
  } catch {
    currentFilters = {};
  }

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
      newFilters[key] = newFilters[key].filter((v) => v !== value);
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
    <div className="space-y-4 text-white">
      {isPending && (
        <div className="overflow-hidden rounded-full border border-white/10 bg-white/5">
          <div className="h-1 w-1/3 animate-pulse bg-blue-400" />
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
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-12 rounded-xl bg-white/5" />
          <div className="h-12 rounded-xl bg-white/5" />
        </div>
      }
    >
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
  title: string;
  facetKey: string;
  distribution: Record<string, number>;
  isChecked: (k: string, v: string) => boolean;
  onFilterChange: (k: string, v: string, c: boolean) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/80"
      >
        <span>{title}</span>
        <span className="ml-6 text-white/50">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="max-h-64 space-y-2 overflow-y-auto px-3 pb-4">
          {Object.entries(distribution).map(([value, count]) => {
            const checked = isChecked(facetKey, value);
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => onFilterChange(facetKey, value, !checked)}
                className={`flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-left transition ${
                  checked
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/60 text-white'
                    : 'bg-transparent text-white/80 hover:bg-white/5'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center border border-white/30 text-xs font-bold ${
                    checked ? 'bg-blue-500/60 text-white' : 'text-transparent'
                  }`}
                >
                  ✕
                </span>
                <span className="flex-1 text-sm">{value}</span>
                <span className="text-[0.65rem] uppercase tracking-wide text-white/50">{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  value: string;
  label: string;
  badge?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1 text-sm',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            type="button"
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 transition',
              isActive
                ? 'bg-[var(--color-primary-muted)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-white',
            )}
          >
            <span>{tab.label}</span>
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}

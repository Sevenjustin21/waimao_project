import type { ReactNode } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = '⌁',
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] px-6 py-12 text-center',
        className,
      )}
    >
      <div className="text-4xl text-[var(--color-primary)]">{icon}</div>
      <div>
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        {description && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

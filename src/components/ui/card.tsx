import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6',
        elevated && 'shadow-[0px_25px_65px_rgba(5,9,15,0.55)]',
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-2 border-b border-[var(--color-border)] pb-4 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

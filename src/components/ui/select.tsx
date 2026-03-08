import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string | null;
}

const baseField =
  'w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-white appearance-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, children, ...props },
  ref,
) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-text-muted)] relative">
      {label && <span>{label}</span>}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            baseField,
            error
              ? 'border-[var(--color-danger)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)]',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          ▾
        </span>
      </div>
      {hint && !error && (
        <span className="text-xs text-[var(--color-text-muted)]">{hint}</span>
      )}
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </label>
  );
});

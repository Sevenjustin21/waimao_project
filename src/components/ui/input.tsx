import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string | null;
}

const baseField =
  'w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, ...props },
  ref,
) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-text-muted)]">
      {label && <span>{label}</span>}
      <input
        ref={ref}
        className={cn(
          baseField,
          error
            ? 'border-[var(--color-danger)]'
            : 'border-[var(--color-border)] focus:border-[var(--color-primary)]',
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <span className="text-xs text-[var(--color-text-muted)]">{hint}</span>
      )}
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </label>
  );
});

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="overflow-x-auto">
        <table
          className={cn(
            'min-w-full divide-y divide-[var(--color-border)] text-sm text-[var(--color-text-muted)]',
            className,
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-[rgba(255,255,255,0.02)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--color-border)]">{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('px-6 py-4 text-sm text-white/90', className)}>
      {children}
    </td>
  );
}

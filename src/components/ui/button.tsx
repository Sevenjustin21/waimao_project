import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const baseStyles =
  'btn-industrial inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-50 disabled:pointer-events-none select-none gap-2';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-bg)] shadow-[0_15px_40px_rgba(43,192,247,0.45)] hover:translate-y-[-1px] active:translate-y-[0] hover:bg-[var(--color-primary-strong)]',
  secondary:
    'bg-[var(--color-surface-muted)] text-white border border-[var(--color-border-strong)] hover:border-[var(--color-primary)]',
  ghost:
    'bg-transparent text-[var(--color-text-muted)] hover:text-white border border-transparent hover:border-[var(--color-border)]',
  danger:
    'bg-[var(--color-danger)] text-white hover:brightness-110 shadow-[0_15px_40px_rgba(255,99,99,0.35)]',
  text: 'bg-transparent text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] px-0',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, children, className, fullWidth, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
});

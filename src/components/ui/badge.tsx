import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  soft?: boolean;
}

const toneMap: Record<BadgeTone, { bg: string; color: string }> = {
  default: {
    bg: 'rgba(43,192,247,0.15)',
    color: 'var(--color-primary)',
  },
  success: {
    bg: 'rgba(96,230,160,0.15)',
    color: 'var(--color-success)',
  },
  warning: {
    bg: 'rgba(255,179,71,0.2)',
    color: 'var(--color-warning)',
  },
  danger: {
    bg: 'rgba(255,99,99,0.2)',
    color: 'var(--color-danger)',
  },
  neutral: {
    bg: 'rgba(255,255,255,0.1)',
    color: 'var(--color-text)',
  },
};

export function Badge({ children, tone = 'default', className, soft = true }: BadgeProps) {
  const palette = toneMap[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        className,
      )}
      style={{
        background: soft ? palette.bg : 'transparent',
        color: palette.color,
        border: soft ? '1px solid transparent' : `1px solid ${palette.color}`,
      }}
    >
      {children}
    </span>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  open: boolean;
  type?: ToastType;
  title?: string;
  description?: ReactNode;
  duration?: number;
  onClose?: () => void;
}

const palette: Record<ToastType, { border: string; icon: string }> = {
  info: { border: 'var(--color-primary)', icon: 'ⓘ' },
  success: { border: 'var(--color-success)', icon: '✓' },
  warning: { border: 'var(--color-warning)', icon: '!' },
  error: { border: 'var(--color-danger)', icon: '⛔' },
};

export function Toast({
  open,
  type = 'info',
  title,
  description,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(open);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  useEffect(() => {
    if (!visible) return;
    timer.current = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const tone = palette[type];

  return (
    <div className="fixed inset-x-0 top-4 z-[1100] mx-auto flex max-w-md animate-fade-in-down items-center gap-3 rounded-2xl border bg-[var(--color-surface)] px-4 py-3 text-sm shadow-[0_20px_40px_rgba(5,9,15,0.5)]">
      <span className="text-lg" style={{ color: tone.border }}>
        {tone.icon}
      </span>
      <div className="flex-1">
        {title && <p className="font-semibold text-white">{title}</p>}
        {description && (
          <p className="text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      <button
        type="button"
        className={cn('text-[var(--color-text-muted)] hover:text-white')}
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
      >
        ✕
      </button>
      <span
        className="absolute inset-0 rounded-2xl border-2 opacity-30 pointer-events-none"
        style={{ borderColor: tone.border }}
      />
    </div>
  );
}

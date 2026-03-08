'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[0_25px_60px_rgba(5,9,15,0.65)]',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            {title && <h2 className="text-2xl font-semibold text-white">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
            )}
          </div>
          <button
            type="button"
            className="text-[var(--color-text-muted)] hover:text-white"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

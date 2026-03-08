import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.05)]',
        className,
      )}
      {...props}
    />
  );
}

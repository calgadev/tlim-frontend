import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  title?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/[0.08] text-fg-secondary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  gold: 'bg-gold/15 text-gold',
  muted: 'bg-fg-muted/[0.12] text-fg-muted',
};

export function Badge({ children, variant = 'default', className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

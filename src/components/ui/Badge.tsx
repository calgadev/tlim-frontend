import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: 'rgba(255,255,255,0.08)', color: '#94A3B8' },
  success: { background: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  warning: { background: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  danger:  { background: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
  info:    { background: 'rgba(96,165,250,0.15)', color: '#60A5FA' },
  gold:    { background: 'rgba(217,179,91,0.15)', color: '#D9B35B' },
  muted:   { background: 'rgba(100,116,139,0.12)', color: '#64748B' },
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}

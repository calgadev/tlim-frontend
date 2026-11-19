import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  metric: ReactNode;
  trend?: ReactNode;
  tone?: 'default' | 'gold' | 'success' | 'danger';
  className?: string;
}

const toneClass = {
  default: 'text-fg',
  gold: 'text-gold-light',
  success: 'text-success',
  danger: 'text-danger',
};

export function StatCard({ label, metric, trend, tone = 'default', className }: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">{label}</p>
      <p className={cn('mb-1 text-3xl font-bold leading-none', toneClass[tone])}>{metric}</p>
      {trend && <p className="mt-2 text-xs text-fg-secondary">{trend}</p>}
    </Card>
  );
}

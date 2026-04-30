import { cn } from '@/lib/utils';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  metric: string | number;
  trend?: string;
  className?: string;
}

export function StatCard({ label, metric, trend, className }: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: '#64748B' }}>
        {label}
      </p>
      <p className="text-4xl font-bold mb-1 leading-none" style={{ color: '#FFFFFF' }}>
        {metric}
      </p>
      {trend && (
        <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>{trend}</p>
      )}
    </Card>
  );
}

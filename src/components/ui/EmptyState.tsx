import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      {icon && (
        <div className="mb-4" style={{ color: '#64748B', opacity: 0.5 }}>
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold mb-1" style={{ color: '#FFFFFF' }}>{title}</h3>
      {description && (
        <p className="text-sm mb-5" style={{ color: '#94A3B8' }}>{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

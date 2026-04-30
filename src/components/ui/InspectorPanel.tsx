import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InspectorPanelProps {
  children: ReactNode;
  className?: string;
}

export function InspectorPanel({ children, className }: InspectorPanelProps) {
  return (
    <aside
      className={cn('flex flex-col flex-shrink-0 h-full overflow-y-auto', className)}
      style={{
        width: 320,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </aside>
  );
}

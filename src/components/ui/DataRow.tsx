import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RowTint = 'none' | 'warning' | 'success';

interface DataRowProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  tint?: RowTint;
  className?: string;
}

const tintBase: Record<RowTint, React.CSSProperties> = {
  none:    {},
  warning: { background: 'rgba(245,158,11,0.06)', borderLeft: '2px solid rgba(245,158,11,0.6)' },
  success: { background: 'rgba(34,197,94,0.06)',  borderLeft: '2px solid rgba(34,197,94,0.6)' },
};

const selectedStyle: React.CSSProperties = {
  background: 'rgba(217,179,91,0.08)',
  borderLeft: '2px solid #D9B35B',
};

export function DataRow({ children, onClick, selected, tint = 'none', className }: DataRowProps) {
  const baseStyle = selected ? selectedStyle : tintBase[tint];
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 px-4 py-3 text-sm transition-colors duration-150',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        color: '#FFFFFF',
        ...baseStyle,
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = baseStyle.background ?? 'transparent';
      }}
    >
      {children}
    </div>
  );
}

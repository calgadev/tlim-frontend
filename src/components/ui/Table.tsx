import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-white/[0.08]">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

type Align = 'left' | 'right' | 'center';
const alignClass: Record<Align, string> = { left: 'text-left', right: 'text-right', center: 'text-center' };

interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function Th({ align = 'left', className, ...props }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-fg-muted',
        alignClass[align],
        className
      )}
      {...props}
    />
  );
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function Td({ align = 'left', className, ...props }: TdProps) {
  return <td className={cn('px-4 py-3 text-fg', alignClass[align], className)} {...props} />;
}

export type RowTint = 'none' | 'success' | 'warning' | 'danger' | 'info';

const tintClass: Record<RowTint, string> = {
  none: '',
  success: 'bg-success/[0.05] shadow-[inset_2px_0_0_rgba(34,197,94,0.6)]',
  warning: 'bg-warning/[0.05] shadow-[inset_2px_0_0_rgba(245,158,11,0.6)]',
  danger: 'bg-danger/[0.05] shadow-[inset_2px_0_0_rgba(239,68,68,0.6)]',
  info: 'bg-info/[0.05] shadow-[inset_2px_0_0_rgba(96,165,250,0.6)]',
};

interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  tint?: RowTint;
  interactive?: boolean;
}

export function Tr({ tint = 'none', interactive, className, ...props }: TrProps) {
  return (
    <tr
      className={cn(
        'border-b border-white/[0.04] transition-colors last:border-b-0',
        tintClass[tint],
        interactive && 'cursor-pointer hover:bg-white/[0.03]',
        className
      )}
      {...props}
    />
  );
}

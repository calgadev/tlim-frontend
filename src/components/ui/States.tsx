import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/api/errors';
import { Button } from './Button';

// ─── Empty ────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon && <div className="mb-4 text-fg-muted opacity-60">{icon}</div>}
      <h3 className="mb-1 text-base font-semibold text-fg">{title}</h3>
      {description && <p className="mb-5 max-w-md text-sm text-fg-secondary">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, title = 'Could not load this', onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)} role="alert">
      <AlertTriangle size={28} className="mb-3 text-danger" aria-hidden />
      <h3 className="mb-1 text-base font-semibold text-fg">{title}</h3>
      <p className="mb-5 max-w-md text-sm text-fg-secondary">{getApiErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Inline error line under a form or action. */
export function InlineError({ error, className }: { error: unknown; className?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className={cn('text-sm text-danger', className)}>
      {typeof error === 'string' ? error : getApiErrorMessage(error)}
    </p>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────

interface LoadingStateProps {
  rows?: number;
  variant?: 'card' | 'row';
  className?: string;
}

function SkeletonCard() {
  return (
    <div className="h-[120px] animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6">
      <div className="mb-4 h-3 w-2/5 rounded-full bg-white/[0.06]" />
      <div className="mb-3 h-8 w-3/5 rounded-full bg-white/[0.06]" />
      <div className="h-3 w-1/3 rounded-full bg-white/[0.04]" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-4 border-b border-white/[0.04] px-4 py-3">
      <div className="h-4 flex-1 rounded-full bg-white/[0.06]" />
      <div className="h-4 w-16 rounded-full bg-white/[0.06]" />
      <div className="h-4 w-20 rounded-full bg-white/[0.06]" />
    </div>
  );
}

export function LoadingState({ rows = 4, variant = 'row', className }: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className={cn(
        variant === 'card' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4' : 'flex flex-col',
        className
      )}
    >
      {Array.from({ length: rows }).map((_, i) => (variant === 'card' ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />))}
    </div>
  );
}

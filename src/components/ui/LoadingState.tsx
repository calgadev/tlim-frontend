import { cn } from '@/lib/utils';

interface LoadingStateProps {
  rows?: number;
  variant?: 'card' | 'row';
  className?: string;
}

function SkeletonCard() {
  return (
    <div
      className="rounded-3xl animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 24,
        height: 120,
      }}
    >
      <div className="h-3 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.06)', width: '40%' }} />
      <div className="h-8 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)', width: '60%' }} />
      <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '30%' }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl animate-pulse"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="h-4 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', width: 60 }} />
      <div className="h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', width: 80 }} />
    </div>
  );
}

export function LoadingState({ rows = 4, variant = 'card', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        variant === 'card'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
          : 'flex flex-col gap-1',
        className
      )}
    >
      {Array.from({ length: rows }).map((_, i) =>
        variant === 'card' ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />
      )}
    </div>
  );
}

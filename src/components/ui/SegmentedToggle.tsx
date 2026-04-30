import { cn } from '@/lib/utils';

interface SegmentedToggleProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedToggle({ options, value, onChange, className }: SegmentedToggleProps) {
  return (
    <div
      className={cn('inline-flex rounded-xl p-1', className)}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="px-4 text-sm font-medium rounded-lg transition-all duration-150"
            style={{
              height: 36,
              background: isActive ? 'linear-gradient(135deg, #D9B35B, #F4D27A)' : 'transparent',
              color: isActive ? '#221607' : '#94A3B8',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

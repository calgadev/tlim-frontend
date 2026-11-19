import { cn } from '@/lib/utils';

interface SegmentedToggleProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** accessible name of the group */
  label?: string;
}

/** Segmented control; also used as the tab bar of detail pages. */
export function SegmentedToggle<T extends string>({ options, value, onChange, className, label }: SegmentedToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex flex-wrap rounded-xl border border-white/[0.08] bg-white/[0.04] p-1', className)}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-9 rounded-lg px-4 text-sm font-medium transition-all duration-150',
              isActive ? 'bg-gold-gradient text-gold-ink' : 'text-fg-secondary hover:text-fg'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

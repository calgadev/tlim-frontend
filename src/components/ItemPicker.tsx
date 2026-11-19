import { useId, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useItemSearch } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';

export interface PickedItem {
  id: number;
  name: string;
}

interface ItemPickerProps {
  label?: string;
  value: PickedItem | null;
  onChange: (item: PickedItem | null) => void;
  error?: string;
  /** ids that should be shown as already added */
  excludeIds?: Set<number>;
  autoFocus?: boolean;
}

const RESULT_LIMIT = 20;

/** Autocomplete over the item catalog (name contains, 2+ characters). */
export function ItemPicker({ label = 'Item', value, onChange, error, excludeIds, autoFocus }: ItemPickerProps) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const debounced = useDebouncedValue(query, 250);
  const { data, isFetching } = useItemSearch({ name: debounced, limit: RESULT_LIMIT });
  const results = debounced.trim().length >= 2 ? (data ?? []) : [];

  if (value) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-fg-secondary">{label}</span>
        <div className="flex h-11 items-center justify-between rounded-xl border border-gold/30 bg-gold/[0.06] px-4 text-sm">
          <span className="truncate font-medium text-fg">{value.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-fg-muted transition-colors hover:text-fg"
            aria-label="Choose another item"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  const choose = (item: PickedItem) => {
    onChange(item);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-fg-secondary">
        {label}
      </label>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden />
        <input
          id={id}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          placeholder="Type at least 2 letters…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!results.length) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const item = results[highlight];
              if (item) choose({ id: item.id, name: item.name });
            }
          }}
          className={cn('field-control h-11 pl-9', error && 'field-control-invalid')}
        />
        {open && debounced.trim().length >= 2 && (
          <ul
            id={`${id}-list`}
            role="listbox"
            className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-overlay py-1 shadow-card"
          >
            {results.length === 0 ? (
              <li className="px-4 py-2 text-sm text-fg-muted">{isFetching ? 'Searching…' : 'No items found'}</li>
            ) : (
              results.map((item, i) => {
                const added = excludeIds?.has(item.id);
                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={i === highlight}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose({ id: item.id, name: item.name });
                    }}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm',
                      i === highlight ? 'bg-white/[0.06] text-fg' : 'text-fg-secondary'
                    )}
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="shrink-0 text-xs text-fg-muted">{added ? 'already added' : item.category}</span>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
      {error && (
        <p role="alert" className="px-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

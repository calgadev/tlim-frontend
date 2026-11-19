import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Inputs take `ref` as a normal prop (React 19), so react-hook-form's register() can be spread onto them.

interface FieldShellProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-fg-secondary">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="px-1 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="px-1 text-xs text-fg-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface CommonProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** class for the wrapper; className goes to the control */
  wrapperClassName?: string;
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, CommonProps {
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, hint, error, wrapperClassName, className, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} className={wrapperClassName}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        className={cn('field-control h-11', error && 'field-control-invalid', className)}
        {...props}
      />
    </FieldShell>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, CommonProps {
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ label, hint, error, wrapperClassName, className, id, children, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FieldShell id={selectId} label={label} hint={hint} error={error} className={wrapperClassName}>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, error, hint)}
          className={cn(
            'field-control h-11 cursor-pointer appearance-none pr-10 [&>option]:bg-overlay',
            error && 'field-control-invalid',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted"
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, CommonProps {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ label, hint, error, wrapperClassName, className, id, ...props }: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  return (
    <FieldShell id={textareaId} label={label} hint={hint} error={error} className={wrapperClassName}>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(textareaId, error, hint)}
        className={cn('field-control min-h-32 py-3 leading-relaxed', error && 'field-control-invalid', className)}
        {...props}
      />
    </FieldShell>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer select-none items-center gap-2', className)}>
      <input type="checkbox" className="h-4 w-4 cursor-pointer rounded accent-gold" {...props} />
      <span className="text-sm text-fg-secondary">{label}</span>
    </label>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'utility' | 'danger' | 'ghost';
type ButtonSize = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-opacity duration-150 ' +
  'cursor-pointer hover:opacity-85 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gold-gradient text-gold-ink',
  secondary: 'border border-white/[0.12] bg-white/5 text-fg',
  utility: 'border border-info/25 bg-info/10 text-info',
  danger: 'border border-danger/30 bg-danger/10 text-danger',
  ghost: 'bg-transparent text-fg-secondary hover:bg-white/5 hover:text-fg hover:opacity-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-11 rounded-xl px-5 text-sm',
  sm: 'h-8 rounded-lg px-3 text-xs',
};

function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variantClasses[variant], sizeClasses[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A router link styled as a button. */
export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

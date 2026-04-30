import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'utility';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #D9B35B, #F4D27A)',
    color: '#221607',
    border: 'none',
  },
  secondary: {
    background: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  utility: {
    background: 'rgba(96,165,250,0.10)',
    color: '#60A5FA',
    border: '1px solid rgba(96,165,250,0.25)',
  },
};

export function Button({ variant = 'primary', children, className, style, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 text-sm font-semibold rounded-xl transition-opacity duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85 active:opacity-70',
        className
      )}
      style={{ height: 44, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

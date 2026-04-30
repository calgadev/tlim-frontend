import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium" style={{ color: '#94A3B8' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'px-4 text-sm rounded-xl w-full outline-none transition-all duration-150',
          'placeholder:text-[#64748B] focus:ring-2 focus:ring-[#D9B35B]/30',
          className
        )}
        style={{
          height: 44,
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: '#FFFFFF',
        }}
        {...props}
      />
    </div>
  );
}

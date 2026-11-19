import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: ReactNode;
}

interface ToastApi {
  success: (message: ReactNode) => void;
  error: (message: ReactNode) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const DURATION_MS = 4_000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (tone: ToastTone, message: ReactNode) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border bg-overlay px-4 py-3 text-sm shadow-card animate-in fade-in slide-in-from-bottom-2',
                t.tone === 'success' ? 'border-success/30' : 'border-danger/30'
              )}
            >
              {t.tone === 'success' ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
              ) : (
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
              )}
              <div className="flex-1 text-fg">{t.message}</div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="text-fg-muted transition-colors hover:text-fg"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

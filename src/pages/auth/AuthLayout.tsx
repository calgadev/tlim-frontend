import type { ReactNode } from 'react';

export function AuthLayout({ subtitle, children, footer }: { subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-card">
        <div className="mb-8 text-center">
          <h1 className="bg-gold-gradient bg-clip-text text-2xl font-semibold tracking-tight text-transparent">TLIM</h1>
          <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-fg-muted">{footer}</p>
      </div>
    </div>
  );
}

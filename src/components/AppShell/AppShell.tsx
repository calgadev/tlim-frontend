import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AppShell({ children, title = 'Dashboard', subtitle, className }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#08101C' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className={cn('flex-1 overflow-auto p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

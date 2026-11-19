import { Suspense } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { LoadingState } from '@/components/ui/States';
import { ActiveCharacterProvider } from '@/contexts/ActiveCharacterContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export interface RouteHandle {
  /** Section title shown in the top bar */
  title?: string;
}

/** Layout for every signed-in route: sidebar + top bar + the matched page. */
export function AppShell() {
  const matches = useMatches();
  const title =
    [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.title)?.handle as RouteHandle | undefined;

  return (
    <ActiveCharacterProvider>
      <div className="flex h-screen overflow-hidden bg-app">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title?.title ?? 'TLIM'} />
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-7xl">
              {/* Route chunks are lazy-loaded; keep the shell visible while one loads */}
              <Suspense fallback={<LoadingState rows={6} />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </ActiveCharacterProvider>
  );
}

import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute';
import { AppShell } from '@/components/AppShell/AppShell';
import type { RouteHandle } from '@/components/AppShell/AppShell';
import { ActiveCharacterRedirect } from '@/components/CharacterScope';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CharactersPage } from '@/pages/characters/CharactersPage';
import { CharacterEditPage, CharacterNewPage } from '@/pages/characters/CharacterFormPage';
import { CharacterDetailPage } from '@/pages/characters/CharacterDetailPage';
import { InventoryPage, SellPage } from '@/pages/inventory/InventoryPage';
import { HuntsPage } from '@/pages/hunts/HuntsPage';
import { HuntImportPage } from '@/pages/hunts/HuntImportPage';
import { HuntDetailPage } from '@/pages/hunts/HuntDetailPage';
import { WikiPage } from '@/pages/wiki/WikiPage';
import { ItemsPage } from '@/pages/wiki/ItemsPage';
import { ItemDetailPage } from '@/pages/wiki/ItemDetailPage';
import { CreaturesPage } from '@/pages/wiki/CreaturesPage';
import { CreatureDetailPage } from '@/pages/wiki/CreatureDetailPage';
import { PricesPage } from '@/pages/prices/PricesPage';
import { ServersPage } from '@/pages/servers/ServersPage';
import { AdminPage, ScraperPage } from '@/pages/admin/AdminPage';

function LandingRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

const page = (path: string, element: ReactNode, title: string): RouteObject => ({
  path,
  element,
  handle: { title } satisfies RouteHandle,
});

// Hunt session detail uses /hunts/session/:id so it can't be confused with /hunts/:characterId.
const routes: RouteObject[] = [
  { path: '/', element: <LandingRedirect /> },
  { path: '/login', element: <GuestRoute><LoginPage /></GuestRoute> },
  { path: '/register', element: <GuestRoute><RegisterPage /></GuestRoute> },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      page('/dashboard', <DashboardPage />, 'Dashboard'),

      page('/characters', <CharactersPage />, 'Characters'),
      page('/characters/new', <CharacterNewPage />, 'Characters'),
      page('/characters/:id', <CharacterDetailPage />, 'Characters'),
      page('/characters/:id/edit', <CharacterEditPage />, 'Characters'),

      page('/inventory', <ActiveCharacterRedirect to={(id) => `/inventory/${id}`} />, 'Inventory'),
      page('/inventory/:characterId', <InventoryPage />, 'Inventory'),
      page('/inventory/:characterId/sell', <SellPage />, 'Inventory'),

      page('/hunts', <ActiveCharacterRedirect to={(id) => `/hunts/${id}`} />, 'Hunts'),
      page('/hunts/session/:id', <HuntDetailPage />, 'Hunts'),
      page('/hunts/:characterId', <HuntsPage />, 'Hunts'),
      page('/hunts/:characterId/import', <HuntImportPage />, 'Hunts'),

      page('/wiki', <WikiPage />, 'Wiki'),
      page('/wiki/items', <ItemsPage />, 'Wiki'),
      page('/wiki/items/:id', <ItemDetailPage />, 'Wiki'),
      page('/wiki/creatures', <CreaturesPage />, 'Wiki'),
      page('/wiki/creatures/:id', <CreatureDetailPage />, 'Wiki'),

      page('/servers', <ServersPage />, 'Servers'),
      page('/prices/:serverId', <PricesPage />, 'Market prices'),

      page('/admin', <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>, 'Admin'),
      page('/admin/scraper', <ProtectedRoute adminOnly><ScraperPage /></ProtectedRoute>, 'Admin'),

      page('*', <NotFoundPage />, 'Not found'),
    ],
  },
];

const router = createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}

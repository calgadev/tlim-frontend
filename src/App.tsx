import { Suspense, lazy } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute';
import { AppShell } from '@/components/AppShell/AppShell';
import type { RouteHandle } from '@/components/AppShell/AppShell';
import { ActiveCharacterRedirect } from '@/components/CharacterScope';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Each section is its own chunk, loaded the first time its route is visited.
function lazyPage<M, K extends keyof M>(load: () => Promise<M>, name: K) {
  return lazy(async () => ({ default: (await load())[name] as ComponentType }));
}

const LoginPage = lazyPage(() => import('@/pages/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('@/pages/auth/RegisterPage'), 'RegisterPage');
const DashboardPage = lazyPage(() => import('@/pages/DashboardPage'), 'DashboardPage');
const CharactersPage = lazyPage(() => import('@/pages/characters/CharactersPage'), 'CharactersPage');
const CharacterNewPage = lazyPage(() => import('@/pages/characters/CharacterFormPage'), 'CharacterNewPage');
const CharacterEditPage = lazyPage(() => import('@/pages/characters/CharacterFormPage'), 'CharacterEditPage');
const CharacterDetailPage = lazyPage(() => import('@/pages/characters/CharacterDetailPage'), 'CharacterDetailPage');
const InventoryPage = lazyPage(() => import('@/pages/inventory/InventoryPage'), 'InventoryPage');
const SellPage = lazyPage(() => import('@/pages/inventory/InventoryPage'), 'SellPage');
const HuntsPage = lazyPage(() => import('@/pages/hunts/HuntsPage'), 'HuntsPage');
const HuntImportPage = lazyPage(() => import('@/pages/hunts/HuntImportPage'), 'HuntImportPage');
const HuntDetailPage = lazyPage(() => import('@/pages/hunts/HuntDetailPage'), 'HuntDetailPage');
const WikiPage = lazyPage(() => import('@/pages/wiki/WikiPage'), 'WikiPage');
const ItemsPage = lazyPage(() => import('@/pages/wiki/ItemsPage'), 'ItemsPage');
const ItemDetailPage = lazyPage(() => import('@/pages/wiki/ItemDetailPage'), 'ItemDetailPage');
const CreaturesPage = lazyPage(() => import('@/pages/wiki/CreaturesPage'), 'CreaturesPage');
const CreatureDetailPage = lazyPage(() => import('@/pages/wiki/CreatureDetailPage'), 'CreatureDetailPage');
const PricesPage = lazyPage(() => import('@/pages/prices/PricesPage'), 'PricesPage');
const ServersPage = lazyPage(() => import('@/pages/servers/ServersPage'), 'ServersPage');
const AdminPage = lazyPage(() => import('@/pages/admin/AdminPage'), 'AdminPage');
const ScraperPage = lazyPage(() => import('@/pages/admin/AdminPage'), 'ScraperPage');

/** Blank dark screen while a signed-out page chunk loads (pages inside the shell use the shell's fallback). */
function Standalone({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-app" />}>{children}</Suspense>;
}

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
  { path: '/login', element: <GuestRoute><Standalone><LoginPage /></Standalone></GuestRoute> },
  { path: '/register', element: <GuestRoute><Standalone><RegisterPage /></Standalone></GuestRoute> },
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
